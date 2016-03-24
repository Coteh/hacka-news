var request = require('request');
var fs = require('fs');
var os = require('os');

var HACKA_URL = "https://news.ycombinator.com/";
var MAX_LIST_STORIES = 500; //The official HN API only stores up to 500 top/new stories
var HNSAVED_FILENAME = ".hnsaved";

var hackaAPIURL = "https://hacker-news.firebaseio.com/v0/";
var savedIDs = [];
var amtOfFeedStories = 10;
var jsonObject = null;

var getAmountOfFeedStories = function(){
    return amtOfFeedStories;
};

var getSavedIDs = function(){
    return savedIDs;
}

var getURL = function(id){
    return HACKA_URL + "item?id=" + id;
};

var setAPIURL = function(url){
    hackaAPIURL = url;
};

var writeJSON = function(serialized, callback){
    fs.writeFile(os.homedir() + "/" + HNSAVED_FILENAME, serialized, function(err) {
        if (err){
            console.log("ERROR: Could not save file.");
            return;
        }
        if (callback != null){
            callback(err);
        }
    });
};

var openSavedPostsJSON = function(){
    var data = null;
    try{
        data = fs.readFileSync(os.homedir() + "/" + HNSAVED_FILENAME, {encoding: 'utf-8'});
    }catch(e){
        if (e.code == 'ENOENT'){
            console.log("ERROR: HN favourites file could not open. Creating new file...");
            writeJSON("{}", null);
        }
        return;
    }
    jsonObject = JSON.parse(data);
    if (jsonObject.ids != null){
        setSavedPostIDS(jsonObject.ids);
    }
};

var getSavedPostID = function(index){
    if (isNaN(index)){
        throw -1;
    }else if (index >= savedIDs.length){
        throw -2;
    }
    return savedIDs[index];
};

var setSavedPostIDS = function(savedList){
    for (var i = 0; i < savedList.length; i++){
        savedIDs.push(savedList[i]);
    }
};

var savePostID = function(postID){
    openSavedPostsJSON();
    savedIDs.push(postID);
    jsonObject.ids = savedIDs;
    var jsonSerialized = JSON.stringify(jsonObject);
    writeJSON(jsonSerialized, function(err){
        console.log("Successfully added post of ID " + postID + " to favourites.");
    });
};

var unsavePostID = function(postID){
    openSavedPostsJSON();
    var index = savedIDs.indexOf(postID);
    if (index <= -1){
        console.log("Could not find a post of this ID saved in your favourites.");
        return;
    }
    savedIDs.splice(index, 1);
    jsonObject.ids = savedIDs;
    var jsonSerialized = JSON.stringify(jsonObject);
    writeJSON(jsonSerialized, function(err){
        console.log("Successfully removed post of ID " + postID + " from favourites.");
    });
};

var requestFeedStoryIDs = function(storyType, callback){
    request(hackaAPIURL + storyType + "stories.json?print=pretty", function(error, response, body) {
        if (error){
            console.log("ERROR: Couldn't load " + storyType + " stories.");
            return;
        }
        ids = JSON.parse(body);
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
    requestFeedStoryIDs("top", function(ids){
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
    getAmountOfFeedStories,
    getSavedIDs,
    getURL,
    setAPIURL,
    openSavedPostsJSON,
    getSavedPostID,
    setSavedPostIDS,
    savePostID,
    unsavePostID,
    requestFeedStoryIDs,
    requestStory,
    requestStoryParsed,
    requestGroup,
    fetchTopID,
    fetchTopURL
};
