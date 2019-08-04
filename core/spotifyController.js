// @ts-check
//Load Constants
const CONSTANTS = require('../constants');
//Load Spotify Node SDK
//Cron module for scheduling refresh
const {spotifyApi} = require('../controllers/spotify');
const spotify_player = require('../controllers/spotifyPlayer');
const slack = require('../controllers/slackController');
const spotify_config = require('./spotifyConfig');
const config = require('../db/config');
const tracks = require('../db/tracks');
const moment = require('moment');
const _ = require('lodash');
const logger = require('../log/winston');


//Load Lokijs db

function isRepeat(disable_repeats_duration, time){
    if (moment(time).add(disable_repeats_duration, 'h').isAfter(moment())){
        return true;
    }
    return false;
}

/**
 * 
 * @param {string} trigger_id 
 * @param {string} track_uri 
 * @param {*} slack_user 
 */
async function addSongToPlaylist(trigger_id, track_uri, slack_user) {
    try {
        // Add song to Spotify playlist
        var playlist_id = spotify_config.getPlaylistId();
        var disable_repeats_duration = spotify_config.getDisableRepeatsDuration();
        var back_to_playlist = spotify_config.getBackToPlaylist();
        var channel_id = spotify_config.getChannel();
        var track_id = track_uri.match(/[^:]+$/)[0];
        let track = await spotify_player.getTrack(track_id);
        var name = _.get(track, 'body.name');
        var artist = _.get(track, 'body.artists[0].name');
        var history = tracks.getHistory(track_uri);
        // Look for existing song
        if (history == null) {
            // Insert a new history record.
            tracks.setHistory(track_uri, name, artist, slack_user.id, moment());
        } else {
            // Update history record with new user
            if (disable_repeats_duration){
                if (await isRepeat(disable_repeats_duration, history.time)){
                    let text = `:no_entry: ${artist} - ${name} was already added around ${moment.duration(moment().diff(history.time)).humanize()} ago.`;
                    await slack.post(channel_id, text);
                    return
                }
            }
            history.slack_user = slack_user.id;
            history.time = moment();
            tracks.updateHistory(history);
        }
        // Free up memory, remove search from tracks.
        let text = `:tada: ${artist} - ${name} was added to the playlist.`
        let current_track = await spotify_player.getPlayingTrack();
        // Get the song back on playlist
        if (back_to_playlist == "yes" && current_track.statusCode != 204 && !spotify_config.onPlaylist(current_track.body.context)){
            let array = [current_track.body.item.uri, track_uri];
            await setBackToPlaylist(playlist_id, array, current_track);
            text += " Spotify will return to the playlist after this song."
        } else{
            await spotifyApi.addTracksToPlaylist(playlist_id, [track_uri]);
        }

        var history = tracks.getSearch(trigger_id);
        if (history != null) {
            tracks.deleteSearch(history);
        }
        await slack.post(channel_id, text);
        return;
    } catch (error) {
        logger.error(`Add Song to Playlist failed ${error}`);
    }
}

/**
 * @param {string} playlist_id
 * @param {string[]} tracks
 * @param {*} current_track Spotifyapi current track response
 */
async function setBackToPlaylist(playlist_id, tracks, current_track){
    try {
        await spotify_player.addTracks(playlist_id, tracks);
        let playlist = await spotify_player.getPlaylist(playlist_id);
        var num_of_searches = Math.ceil(_.get(playlist, 'body.tracks.total')/100);
        // Find track's last added location. We will have to search the playlist part by part from back to front.
        for (let offset = num_of_searches - 1; offset >= 0; offset--) {
            let playlist_tracks = await spotify_player.getPlaylistTracks(playlist_id, offset);
            let track_list = _.get(playlist_tracks, 'body.items');
            let index = _.findLastIndex(track_list, track => {
                return track.track.uri == tracks[0]
            });
            if (index != -1){
                await spotify_player.playWithContext(playlist_id, offset*100+index, current_track.body.progress_ms+1000);
                if (current_track.body.is_playing == false){
                    await spotify_player.pause();
                }
                return;
            }
        }
    } catch (error) {
        logger.info(`Get back to playlist failed ${error}`);
        throw Error(error);
    }
}

async function isRepeatInPlaylist(track_uri){
    try {
        logger.info("Find track in playlist started.")
        var playlist_id = spotify_config.getPlaylistId();
        var disable_repeats_duration = spotify_config.getDisableRepeatsDuration();
        var history = tracks.getHistory(track_uri);
        let playlist = await spotify_player.getPlaylist(playlist_id);
    
        //Spotify only allows a maximum of 100 tracks to return per playlist so we need to amke multiple calls.
        if (_.get(playlist, 'body.tracks.total')){
            var num_of_searches = Math.ceil(_.get(playlist, 'body.tracks.total')/100);
            var promise_list = [];
            // Spotify API only allows a maximum of 100 tracks, SO: we need to make multiple calls to search the playlist.
            for (let offset = 0; offset < num_of_searches; offset++){
                // Add a search to a promise list so we can run this all simultaneously
                promise_list.push(new Promise(async (resolve, reject) => {
                    try {
                        let playlist_tracks = await spotify_player.getPlaylistTracks(playlist_id, offset);
                        let track_list = _.get(playlist_tracks, 'body.items');
                        let index = _.findLastIndex(track_list, track => {
                            return track.track.uri == track_uri && isRepeat(disable_repeats_duration, history.time)
                        });
                        // Due to promise.all short circuiting on fails, we will pass the success field through the failiure field.
                        if (index == -1){
                            resolve(null);
                        } else {
                            logger.info(`Track found in playlist at index ${offset*100+index}`);
                            reject(track_list[index]);
                        }
                    } catch (error) {
                        logger.error(`Finding track in Playlist failed. ${error}`);
                    }
                }));
            }
            //This one is weird! Success is caught in errors
            try {
                await Promise.all(promise_list);
                return false;
            } catch (error) {
                return true;
            }
        }
    } catch (error) {
        logger.error(`Spotify failed to find track in playlist ${error}`);
    }
    return false;
}

/**
 * Hits play on Spotify
 */
async function play(response_url) {
    try {
        // Find our current playback state
        let player_info = await spotify_player.getPlaybackState();
        if (_.get(player_info, 'body.is_playing')) {
            await slack.sendReply(":information_source: Spotify is already playing.", null, response_url);
            return;
        }
        // Try regular play method
        if (_.get(player_info, 'body.device')) {
            await spotify_player.play();
            await slack.sendReply(":arrow_forward: Spotify is now playing.", null, response_url);
            return;
        }
        // Try spotify transfer to device workaround
        logger.info("Trying Spotify transfer playback workaround");
        let device_list = await spotify_player.getDevices();
        if (_.get(device_list, 'body.devices.length') == 0) {
            await slack.sendReply(":information_source: Your Spotify device is currently closed.", null, response_url);
            return;
        }
        var default_device = spotify_config.getDefaultDevice();
        let device = _.find(device_list.body.devices, {
            id: default_device
        });
        if (device) {
            await spotify_player.transferPlayback(device.id);
            await slack.sendReply(":arrow_forward: Spotify is now playing.", null, response_url);
            return;

        }
    } catch (error) {
        logger.error(`Spotify failed to play ${error}`);
    }
    await slack.sendReply(":arrow_forward: Spotify failed to play.", null, response_url);
    return;
}
/**
 * Hits pause on Spotify
 */
async function pause(response_url) {
    try {
        // Check player state
        let player_info = await spotify_player.getPlaybackState();
        if (_.get(player_info, 'body.is_playing') == false) {
            await slack.sendReply(":information_source: Spotify is already paused.", null, response_url);
            return;
        }
        // Try regular pause method
        if (_.get(player_info, 'body.device')) {
            await spotify_player.pause();
            await slack.sendReply(":arrow_forward: Spotify is now paused.", null, response_url);
            return;
        }
        // Check device status workaround
        logger.info("Checking device status");
        let device_list = await spotify_player.getDevices();
        if (_.get(device_list, 'body.devices.length') > 0) {
            await slack.sendReply(":information_source: Spotify is already paused.", null, response_url);
            return;
        } else {
            await slack.sendReply(":information_source: Your Spotify device is currently closed.", null, response_url);
            return;
        }
    } catch (error) {
        logger.error(`Spotify failed to pause ${error}`);
    }
    await slack.sendReply(":warning: Spotify failed to pause.", null, response_url);
    return;

}

/**
 * Gets up to 3 tracks from our local db
 * @param {string} trigger_id Slack trigger id
 */
async function getThreeTracks(trigger_id, pagenum, response_url) {
    try {
        var search = tracks.getSearch(trigger_id);
        // Searches expire after X time.
        if (search == null) {
            await slack.sendEphemeralReply(`:slightly_frowning_face: I'm sorry, your search expired. Please try another one.`, null, response_url);
            return;
        }
        // Our search has hit the end, remove it.
        if (_.get(search, 'tracks.length') == 0) {
            tracks.deleteSearch(search);
            await slack.sendEphemeralReply(`:information_source: No more tracks. Try another search.`, null, response_url);
            return;
        }
        // Make sure it is an int.
        pagenum = parseInt(pagenum);

        // Get 3 tracks of the search
        var current_tracks = search.tracks.splice(0, 3);
        var slack_attachments = []
        for (let track of current_tracks) {
            slack_attachments.push(slack.trackToSlackAttachment(track, trigger_id));
        }
        // Update DB
        tracks.updateSearch(search);

        slack_attachments.push(slack.slackAttachment(`Page: ${pagenum}/${search.total_pages}`, trigger_id,
            "See more tracks", "See more tracks", CONSTANTS.SEE_MORE_TRACKS, pagenum+1));
        await slack.sendEphemeralReply(`:mag: Are these the tracks you were looking for?`, slack_attachments, response_url);
        return;
    } catch (error) {
        logger.error(`Failed to get 3 more tracks ${error}`);
    }
    await slack.sendEphemeralReply(`Spotify failed to get 3 more tracks`, null, response_url);
    return;
}

/**
 * Finds songs based on a query on Spotify
 * @param {String} query Search term
 */
async function find(query, trigger_id, response_url) {
    try {
        logger.info(`Find tracks for query "${query}" triggered.`);
        let search_results = await spotify_player.getSearchTracks(query);
        let search_tracks = _.get(search_results, 'body.tracks.items');
        if (search_tracks.length == 0) {
            //No Tracks found
            await slack.sendEphemeralReply(`:slightly_frowning_face: No tracks found for the search term "${query}". Try another search?`, response_url);
            return;
        } else {
            // Store in our db
            tracks.setSearch(trigger_id, search_tracks, Math.ceil(search_tracks.length / 3));
            await getThreeTracks(trigger_id, 1, response_url);
            return;
        }
    } catch (error) {
        logger.error(`Spotify failed to find tracks ${error}`);
    }
    await slack.sendEphemeralReply(`:slightly_frowning_face: Finding tracks failed.`, response_url);
    return;
}

async function whom(response_url) {
    try {
        var spotify_user_id = spotify_config.getSpotifyUserId();
        let current_track = await spotify_player.getPlayingTrack();
        if (current_track.statusCode == 204){
            await slack.sendReply(":information_source: Spotify is currently not playing.", null, response_url);
            return;
        }
        // Check if Spotify is playing from the playlist.
        if(!spotify_config.onPlaylist(current_track.body.context)){
            await slack.sendReply(`:information_source: Spotify is not playing from the playlist. Current Song: ${current_track.body.item.artists[0].name} - ${current_track.body.item.name}`, null, response_url);
            return;

        }
        else {
            var previous_track = tracks.getHistory(current_track.body.item.uri);
            var playlist_id = spotify_config.getPlaylistId();
            let playlist = await spotify_player.getPlaylist(playlist_id);
            var num_of_searches = Math.ceil(playlist.body.tracks.total/100);

            // Find track's last added location. We will have to search the playlist part by part from back to front.
            for (let offset = num_of_searches-1; offset >=0 ; offset--){
                let playlist_tracks = await spotify_player.getPlaylistTracks(playlist_id, offset);
                let track_list = _.get(playlist_tracks, 'body.items');
                let index = _.findLastIndex(track_list, track => {
                    return track.track.uri == current_track.body.item.uri
                });
                // Track was found
                if (index != -1){
                    let found_track = track_list[index];
                    if (previous_track == null || found_track.added_by.id != spotify_user_id) {
                        await slack.sendReply(`:white_frowning_face: ${current_track.body.item.artists[0].name} - ${current_track.body.item.name} was added ${moment(found_track.added_at).fromNow()} directly to the Spotify by ${found_track.added_by.id}.`, null, response_url);
                        return;            
                    }
                    else{
                        await slack.sendReply(`:microphone: ${current_track.body.item.artists[0].name} - ${current_track.body.item.name} was last added ${moment(previous_track.time).fromNow()} by <@${previous_track.slack_user}>.`, null, response_url);
                        return;
                    }
                }
            }
        }
    } catch (error) {
        logger.error(`Whom failed ${error}`);
    }
    // await slack.sendReply(`Whom called failed`, null, response_url);
    return;
}

function skip_attachment(slack_users, num_votes, track_uri){
    var users = "";
    var votes_word = "votes";
    for (let user of slack_users){
        users += `<@${user}> `
    }
    if (num_votes == 1){
        votes_word = "vote";
    }
    var attachment = {
        "text": `Votes: ${users}`,
        "footer": `${num_votes} more ${votes_word} needed.`,
        "fallback": `Votes: ${users}`,
        "callback_id": track_uri,
        "color": "#3AA3E3",
        "attachment_type": "default",
        "actions": [
            {
                "name": CONSTANTS.SKIP,
                "text": "Skip",
                "type": "button",
                "value": "skip"
            }
        ]
    }
    return attachment;
}

async function skip(slack_user, response_url){
    try {
        logger.info("Skip triggered.");
        var skip_votes = spotify_config.getSkipVotes();
        var skip_track = tracks.getSkip();
        let current_track = await spotify_player.getPlayingTrack();
        if (current_track.statusCode == 204){
            await slack.sendReply(":information_source: Spotify is currently not playing.", null, response_url);
            return;
        }
        else{
            // Store Skip Info Somewhere
            if (skip_track == null){
                tracks.setSkip();
                skip_track = tracks.getSkip();
            }
            if (skip_track.uri == current_track.body.item.uri){
                await slack.sendEphemeralReply(":information_source: There is already a vote to skip this song.", null, response_url);
                return;    
            }
            tracks.setSkip(current_track.body.item.uri, current_track.body.item.name, current_track.body.item.artists[0].name, [slack_user]);
            await slack.sendReply(`:black_right_pointing_double_triangle_with_vertical_bar: <@${slack_user}> has requested to skip ${current_track.body.item.artists[0].name} - ${current_track.body.item.name}. `, 
                [skip_attachment([slack_user], parseInt(skip_votes)-1, current_track.body.item.uri)], response_url);
            return;
        }
    } catch (error) {
        logger.error(`Spotify failed to skip ${error}`);
    }
    await slack.sendEphemeralReply("Failed to process skip command", null, response_url);
}

async function voteSkip(slack_user, track_uri, response_url){
    try {
        logger.info("Skip vote triggered");
        var skip_votes = spotify_config.getSkipVotes();
        var auth = config.getAuth();
        var skip = tracks.getSkip();
        var channel_id = spotify_config.getChannel();
        let current_track = await spotify_player.getPlayingTrack();
        if (skip.uri != track_uri || _.get(current_track,'body.item.uri') != skip.uri){
            await slack.sendReply("This vote has expired.", null, response_url);
            return;
        }
        if (skip.users.includes(slack_user.id)){
            slack.postEphemeral(auth.channel_id, slack_user.id, "You have already voted on this. ");
            await slack.sendReply("", null, response_url);
            return;
        }
        else{
            skip.users.push(slack_user.id);
            if (skip_votes==skip.users.length){
                var users = "";
                for (let user of skip.users){
                    users += `<@${user}> `;
                }
                await spotify_player.skip();
                await slack.sendDeleteReply(`:black_right_pointing_double_triangle_with_vertical_bar: ${skip.artist} - ${skip.name} was skipped by: ${users}`, null, response_url);
                return;
            }
            await slack.sendDeleteReply(`:black_right_pointing_double_triangle_with_vertical_bar: <@${skip.users[0]}> has requested to skip ${skip.artist} - ${skip.name}.`, [skip_attachment(skip.users, parseInt(skip_votes)-skip.users.length, track_uri)], response_url);
            return; 
    
        }
    } catch (error) {
        logger.error(`Vote to skip failed ${error}`)
    }
}

async function reset(response_url, user_id) {
    logger.info("Reset confirmed");
    var playlist_id = spotify_config.getPlaylistId();
    var channel_id = spotify_config.getChannel();
    await spotify_player.reset(playlist_id);
    await slack.sendEphemeralReply(":rotating_light: Are you sure you want to clear the playlist?", [{
        "fallback": ":boom: ",
        "text": ":boom: Done"
    }], response_url);
    await slack.post(channel_id, `:boom: The playlist has been nuked by <@${user_id}>`);
}

async function resetRequest(response_url){
    logger.info("Reset request triggered");
    await slack.sendEphemeralReply(`:rotating_light: Are you sure you want to clear the playlist?`, [slack.slackAttachment('', CONSTANTS.RESET, 
        ":rotating_light: Are you sure you want to clear the playlist?", 'Yes I am sure.', CONSTANTS.RESET, CONSTANTS.RESET)], response_url);
    return;
}

async function currentTrack(response_url){
    let current_track = await spotify_player.getPlayingTrack();
    if (current_track.statusCode == 204){
        slack.sendReply(":information_source: Spotify is currently not playing", null, response_url);
        return;
    }
    if (spotify_config.onPlaylist(current_track.body.context)){
        slack.sendReply(`:loud_sound: *Now Playing:* ${current_track.body.item.artists[0].name} - ${current_track.body.item.name} from the Spotify playlist`, null, response_url);
        return;
    } else {
        slack.sendReply(`:loud_sound: *Now Playing:* ${current_track.body.item.artists[0].name} - ${current_track.body.item.name}`, null, response_url);
        return;
    }
}

async function currentPlaylist(response_url){
    var current_playlist = spotify_config.getPlaylistName();
    var playlist_link = spotify_config.getPlaylistLink();
    slack.sendReply(`:notes: Currently playing from Spotify playlist: <${playlist_link}|${current_playlist}>`, null, response_url); 
    return;
}

module.exports = {
    currentPlaylist,
    currentTrack,
    play,
    pause,
    find,
    getThreeTracks,
    addSongToPlaylist,
    whom,
    skip,
    voteSkip,
    reset,
    resetRequest
};