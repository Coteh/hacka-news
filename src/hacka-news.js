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
            console.log("ERROR: Couldn't load " + storyType + " stories.");
            return;
        }
        ids = JSON.parse(body);
        var maxLimit = (storyType == "top" || storyType == "new") ? MAX_LIST_STORIES : MAX_POSTINGS_STORIES;
        if (limit < maxLimit) {
            ids = pruneResults(ids, limit);
        }
        callback(ids);
    });
};

var requestStory = function(id, callback){
    request(hackaAPIURL + "item/" + id + ".json?print=pretty", function (error, response, body) {
        if (error){
            console.log("ERROR: Couldn't load story.");
            return;
        }
        callback(body);
    });
};

var requestStoryParsed = function(id, callback){
    requestStory(id, function(hnJsonStr){
        var parsedStory = JSON.parse(hnJsonStr);
        injectStoryExtras(parsedStory, callback);
        // callback(parsedStory);
    });
};

var injectStoryExtras = function(parsedStory, callback) {
    parsedStory.commentsUrl = getURL(parsedStory.id); //injecting comments url address into the node
    if (parsedStory.type == "comment"){
        requestRootParent(parsedStory, function(rootParent){
            parsedStory.rootParent = rootParent;
            callback(parsedStory);
        });
    }else if (parsedStory.type == "poll"){
        requestPollOptions(parsedStory, function(pollOptArr){
            parsedStory.partNodes = pollOptArr;
            callback(parsedStory);
        });
    }else{
        callback(parsedStory);
    }
};

var requestRootParent = function(childNode, callback){
    if (childNode == null){
        console.log("ERROR: Child node is null.");
        return;
    }
    //Get root parent of post (which, for a comment, should be the article they commented on)
    var rootParent = childNode;
    while (rootParent.parent != null){
        rootParent = rootParent.parent;
        // console.log(rootParent);
    }
    requestStoryParsed(rootParent, function(parsed){
        callback(parsed);
    });
};

var requestPollOptions = function(pollNode, callback){
    if (pollNode == null){
        console.log("ERROR: Poll node is null.");
        return;
    }
    var pollOptNodes = new Array();
    for (var i = 0; i < pollNode.parts.length; i++){
        //Get each pollopt
        requestStoryParsed(pollNode.parts[i], function(parsedPollOpt){
            pollOptNodes.push(parsedPollOpt);
            if (pollOptNodes.length >= pollNode.parts.length){
                callback(pollOptNodes);
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
        (function(index){
            requestStoryParsed(idList[index], function(hnJson){
                loadedList[index] = hnJson;
                loadedCount++;
                if (loadedCount >= expectedCount){
                    callback(loadedList);
                }
            });
        })(i);
    }
};

var fetchTopID = function(index, callback) {
    if (index < 0 || index >= MAX_LIST_STORIES){
        throw -1;
    }
    requestFeedStoryIDs("top", 1, function(ids){
        if (ids == null){
            console.log("ERROR: Top stories did not load.");
            return;
        }
        callback(ids[index]);
    });
};

var fetchTopURL = function(index, callback) {
    fetchTopID(index, function(id){
        callback(getURL(id));
    });
};

module.exports = {
    getURL,
    setAPIURL,
    requestFeedStoryIDs,
    requestStory,
    requestStoryParsed,
    requestGroup,
    fetchTopID,
    fetchTopURL
};

module.exports.time = hackaTime;
