const CONSTANTS = require('../constants');
const init = require('./init2');
const {db2} = init;

function getSearches(){
    return db2.getCollection(CONSTANTS.DB.COLLECTION.SEARCH);
}

function createSearch(search){
    let searches = getSearches();
    searches.insert(search);
}

function getSearch(trigger_id){
    let searches = getSearches();
    return searches.findOne( {[CONSTANTS.DB.KEY.TRIGGER_ID]: trigger_id} );
}

function updateSearch(search){
    let searches = getSearches();
    searches.update(search);
}

function deleteSearch(search){
    let searches = getSearches();
    searches.remove(search);
}

function getAllHistory(){
    return db2.getCollection(CONSTANTS.DB.COLLECTION.HISTORY);
}

function createHistory(history){
    let all_history = getAllHistory();
    all_history.insert(history);
}

function getHistory(uri){
    let all_history = getAllHistory();
    return all_history.findOne({[CONSTANTS.DB.KEY.TRACK_URI]: uri});
}

function updateHistory(history){
    let all_history = getAllHistory();
    all_history.update(history);
}

function getOtherCollection(){
    return db2.getCollection(CONSTANTS.DB.COLLECTION.OTHER)
}

function createOther(name){
    let other = getOtherCollection();
    other.insert({
        [CONSTANTS.DB.KEY.TYPE]: name
    });
}

function getOther(name){
    let other = getOtherCollection();
    return other.findOne({[CONSTANTS.DB.KEY.TYPE]: name});
}

function updateOther(other_object){
    let other = getOtherCollection();
    other.update(other_object);
}

function getAllBlacklist(){
    return db2.getCollection(CONSTANTS.DB.COLLECTION.BLACKLIST);
}

function createBlacklist(blacklist){
    let blacklists = getAllBlacklist();
    blacklists.insert(blacklist);
}

function getBlacklist(uri){
    let blacklists = getAllBlacklist()
    return blacklists.findOne( {[CONSTANTS.DB.KEY.TRACK_URI]: uri} );
}

function getAllBlacklists(){
    let blacklists = getAllBlacklist();
    return blacklists.find();
}

function deleteBlacklist(blacklist){
    let blacklists = getAllBlacklist();
    blacklists.remove(blacklist);
}

// function getCurrent(){
//     var current = db2.getCollection(CONSTANTS.CURRENT_TRACK);
//     return current.findOne( {name: CONSTANTS.CURRENT_TRACK} );
// }

// function getHistory(uri){
//     var history = db2.getCollection(CONSTANTS.HISTORY);
//     return history.findOne( {track: uri} );
// }

// function getSearch(trigger_id){
//     var searches = db2.getCollection(CONSTANTS.SEARCH);
//     return searches.findOne( { trigger_id: trigger_id } );
// }

// function getSkip(){
//     var skip = db2.getCollection(CONSTANTS.SKIP);
//     return skip.findOne( {track: CONSTANTS.SKIP} );
// }


// function setHistory(uri, name, artist, user_id, time){
//     var history = db2.getCollection(CONSTANTS.HISTORY);
//     history.insert({
//         track: uri,
//         name: name,
//         artist: artist,
//         user_id : user_id,
//         time: time
//     });
// }

// function setCurrent(uri){
//     var current = db2.getCollection(CONSTANTS.CURRENT_TRACK);
//     var current_track = current.findOne({name: CONSTANTS.CURRENT_TRACK});
//     if (current_track == null){
//         current.insert({
//             name: CONSTANTS.CURRENT_TRACK,
//             uri: uri
//         })
//     }
//     else{
//         current_track.uri = uri;
//         current.update(current_track);
//     }

// }

// function setArtist(trigger_id, artists, total_pages){
//     var searches = db2.getCollection(CONSTANTS.SEARCH);
//     searches.insert({
//         trigger_id: trigger_id,
//         artists: artists,
//         total_pages: total_pages
//     })
// }

// function setSearch(trigger_id, tracks, total_pages){
//     var searches = db2.getCollection(CONSTANTS.SEARCH);
//     searches.insert({
//         trigger_id: trigger_id,
//         tracks: tracks,
//         total_pages: total_pages
//     });
// }

// function setArtistSearch(trigger_id, artists, total_pages){
//     var searches = db2.getCollection(CONSTANTS.SEARCH);
//     searches.insert({
//         trigger_id: trigger_id,
//         artists: artists,
//         total_pages: total_pages
//     });
// }

// function setSkip(uri, name, artist, users){
//     var skip = db2.getCollection(CONSTANTS.SKIP);
//     skip_track = skip.findOne({track : CONSTANTS.SKIP});
//     if (skip_track == null){
//         skip.insert({
//             track: CONSTANTS.SKIP
//         });
//         return;
//     }
//     skip_track.uri = uri;
//     skip_track.name = name;
//     skip_track.artist = artist;
//     skip_track.users = users;
//     skip.update(skip_track);
// }

// function updateHistory(history_obj){
//     var history = db2.getCollection(CONSTANTS.HISTORY);
//     history.update(history_obj);
// }

// function updateSearch(search_obj){
//     var searches = db2.getCollection(CONSTANTS.SEARCH);
//     searches.update(search_obj);
// }

// function deleteSearch(search){
//     var searches = db2.getCollection(CONSTANTS.SEARCH);
//     searches.remove(search);
// }

// function clearSearches(){
//     var searches = db2.getCollection(CONSTANTS.SEARCH);
//     searches.clear( {removeIndices: true} );
// }

module.exports = {
    createBlacklist,
    createHistory,
    createOther,
    createSearch,
    deleteBlacklist,
    deleteSearch,
    getAllBlacklists,
    getBlacklist,
    getHistory,
    getOther,
    getSearch,
    updateHistory,
    updateOther,
    updateSearch
}