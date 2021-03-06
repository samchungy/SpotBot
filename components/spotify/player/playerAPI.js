const spotify_api = require('../../spotify/auth/spotifyAuthAPI').spotifyApi
const logger = require('../../../log/winston');
const CONSTANTS = require('../../../constants');

async function getDevices(){
    try {
        return device_list = await spotify_api.getMyDevices();
    } catch (error) {
        logger.error(`Spotify API: Get devices failed.`, error);
        throw Error(error);
    }
}

async function getAllPlaylists(){
    try {
        return await spotify_api.getUserPlaylists({ limit: 50 });
    } catch (error) {
        logger.error(`Spotify API: Get all playlists failed.`, error);
        throw Error(error);
    }
}

async function createPlaylist(id, name){
    try {
        return await spotify_api.createPlaylist(id, name, {
            public : false,
            collaborative : true
        });
    } catch (error) {
        logger.error(`Spotify API: Create playlist failed.`, error);
        throw Error(error);
    }
}

async function play(){
    try {
        return await spotify_api.play();
    } catch (error) {
        logger.error(`Spotify API: Play failed.`, error);
        throw Error(error);
    }
}

async function pause(){
    try {
        return await spotify_api.pause();
    } catch (error) {
        logger.error(`Spotify API: Pause failed.`, error);
    }
}

async function playPlaylist(playlist_id){
    try {
        return await spotify_api.play({
            context_uri: `spotify:playlist:${playlist_id}`
        });
    } catch (error) {
        logger.error(`Spotify API: Pause failed.`, error);
    }
}


async function getPlaybackState(){
    try {
        return await spotify_api.getMyCurrentPlaybackState();
    } catch (error) {
        logger.error(`Spotify API: Get playback state failed.`, error);
        throw Error(error);
    }
}

async function transferPlayback(device_id){
    try {
        return await spotify_api.transferMyPlayback(
            {
                device_ids: [device_id],
                play: true
            }
        );
    } catch (error) {
        logger.error(`Spotify API: Play failed.`, error);
        throw Error(error);
    }
}

async function getPlayingTrack(){
    try{
        return await spotify_api.getMyCurrentPlayingTrack();
    } catch (error) {
        logger.error(`Spotify API: Get current playing track failed.`, error);
        throw Error(error);
    }
}

async function skip(){
    try {
        return await spotify_api.skipToNext();
    } catch (error) {
        logger.error(`Spotify API: Skip failed.`, error);
        throw Error(error);
    }
}

async function reset(playlist_id){
    try {
        // Bit of a meme here lol, enjoy.
        await spotify_api.replaceTracksInPlaylist(playlist_id, [CONSTANTS.AFRICA]);
        await spotify_api.removeTracksFromPlaylist(playlist_id, [{uri: CONSTANTS.AFRICA}]);
    } catch (error) {
        logger.error(`Spotify API: Reset failed. `, error);
        throw Error(error);
    }
}


async function getPlaylist(playlist_id){
    try {
        return await spotify_api.getPlaylist(playlist_id, {
            fields: "tracks.total"
        });
    } catch (error) {
        logger.error(`Spotify API: Get playlist failed.`, error);
        throw Error(error);
    }
}

module.exports = {
    createPlaylist,
    getAllPlaylists,
    getDevices,
    getPlaybackState,
    getPlayingTrack,
    getPlaylist,
    pause,
    play,
    playPlaylist,
    reset,
    skip,
    transferPlayback
}