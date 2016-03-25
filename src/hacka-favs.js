var fs = require('fs');
var os = require('os');

var HNSAVED_FILENAME = ".hnsaved";
var savedIDs = [];

var getSavedIDs = function(){
    return savedIDs;
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

module.exports = {
    getSavedIDs,
    getSavedPostID,
    setSavedPostIDS,
    openSavedPostsJSON,
    savePostID,
    unsavePostID,
};
