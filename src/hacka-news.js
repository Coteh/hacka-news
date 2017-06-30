var request = require('request');
var hackaTime = require('./hacka-time');

var HACKA_URL = "https://news.ycombinator.com/";
const MAX_LIST_STORIES = 500; //The official HN API only provides 500 top/new stories
const MAX_POSTINGS_STORIES = 200; //The official HN API only provides 200 ask/show/job stories

var hackaAPIURL = "https://hacker-news.firebaseio.com/v0/";
var jsonObject = null;

var getURL = function(id){
    return HACKA_URL + "item?id=" + id;
};

var setAPIURL = function(url){
    hackaAPIURL = url;
};

var pruneResults = function(ids, limit){
    var prunedIDs = ids.slice(0, limit);
    return prunedIDs;
}

var requestFeedStoryIDs = function(storyType, limit, callback){
    request(hackaAPIURL + storyType + "stories.json?print=pretty", function(error, response, body) {
        if (error){
            callback({message: "ERROR: Couldn't load " + storyType + " stories."}, null);
            return;
        }
        ids = JSON.parse(body);
        if (ids == null) {
            callback({message: "ERROR: Malformed ID array."}, null);
            return;
        }
        if (ids.error !== undefined) {
            callback({message: "ERROR: " + ids.error}, null);
            return;
        }
        var maxLimit = (storyType == "top" || storyType == "new") ? MAX_LIST_STORIES : MAX_POSTINGS_STORIES;
        if (limit < maxLimit) {
            ids = pruneResults(ids, limit);
        }
        callback(null, {ids: ids});
    });
};

var requestStory = function(id, callback){
    request(hackaAPIURL + "item/" + id + ".json?print=pretty", function (error, response, body) {
        if (error || body === "null\n"){
            callback({message: "ERROR: Couldn't retrieve JSON stringified story."}, null);
            return;
        }
        callback(null, {bodyStr: body});
    });
};

var parseStory = function(jsonStr){
    return JSON.parse(jsonStr);
}

var requestStoryParsed = function(id, callback){
    requestStory(id, function(err, result){
        if (err) {
            callback({message: "ERROR: Couldn't load story."}, null);
            return;
        }
        var parsedStory = parseStory(result.bodyStr);
        injectStoryExtras(parsedStory, callback);
    });
};

var injectStoryExtras = function(parsedStory, callback) {
    parsedStory.commentsUrl = getURL(parsedStory.id); //injecting comments url address into the node
    if (parsedStory.type == "comment"){
        requestRootParent(parsedStory, function(rootParent){
            parsedStory.rootParent = rootParent;
            callback(null, parsedStory);
        });
    }else if (parsedStory.type == "poll"){
        requestPollOptions(parsedStory, function(pollOptArr){
            parsedStory.partNodes = pollOptArr;
            callback(null, parsedStory);
        });
    }else{
        callback(null, parsedStory);
    }
};

var requestRootParent = function(childNode, callback){
    if (childNode == null){
        callback({message: "ERROR: Child node is null."}, null);
        return;
    }
    //Get root parent of post (which, for a comment, should be the article they commented on)
    var rootParent = childNode;
    while (rootParent.parent != null){
        rootParent = rootParent.parent;
    }
    requestStoryParsed(rootParent, function(err, parsed){
        if (err) {
            callback({message: "ERROR: Could not load root parent post."}, null);
            return;
        }
        callback(null, parsed);
    });
};

var requestPollOptions = function(pollNode, callback){
    if (pollNode == null){
        callback({message: "ERROR: Poll node is null."}. null);
        return;
    }
    var pollOptNodes = new Array();
    for (var i = 0; i < pollNode.parts.length; i++){
        //Get each pollopt
        requestStoryParsed(pollNode.parts[i], function(err, parsedPollOpt){
            if (err) {
                callback({message: "ERROR: One of the poll options could not load."}, null);
                return;
            }
            pollOptNodes.push(parsedPollOpt);
            if (pollOptNodes.length >= pollNode.parts.length){
                callback(null, {pollOpts: pollOptNodes});
            }
        });
    }
};

var requestGroup = function(idList, callback){
    var loadedList = [];
    var loadedCount = 0;
    var expectedCount = idList.length;
    for (var i = 0; i < idList.length; i++){
        loadedList.push(null);
        var shouldTerminate = false;
        (function(index){
            requestStoryParsed(idList[index], function(err, hnJson){
                if (err) {
                    callback({message: "ERROR: One of the messages in this group could not load."}, null);
                    shouldTerminate = true;
                    return;
                }
                loadedList[index] = hnJson;
                loadedCount++;
                if (loadedCount >= expectedCount){
                    callback(null, {storyList: loadedList});
                    shouldTerminate = true;
                    return;
                }
            });
        })(i);
        if (shouldTerminate) {
            return;
        }
    }
};

var fetchTopID = function(index, callback) {
    if (index < 0 || index >= MAX_LIST_STORIES){
        callback({message: "ERROR: Index provided is not within proper range."}, null);
        return;
    }
    requestFeedStoryIDs("top", 1, function(err, result){
        if (err){
            callback({message: "ERROR: Top story did not load."}, null);
            return;
        }
        callback(null, {id: ids[index]});
    });
};

var fetchTopURL = function(index, callback) {
    fetchTopID(index, function(err, result){
        if (err) {
            callback({message: "ERROR: Could not load top story URL."}, null);
        }
        callback(null, {url: getURL(id)});
    });
};

module.exports = {
    getURL,
    setAPIURL,
    requestFeedStoryIDs,
    requestStory,
    parseStory,
    requestStoryParsed,
    injectStoryExtras,
    requestRootParent,
    requestPollOptions,
    requestGroup,
    fetchTopID,
    fetchTopURL
};

module.exports.time = hackaTime;
