var should = require("should");
var hackaNews = require("../src/hacka-news");
var serva = require("./server/server");

hackaNews.setAPIURL("http://localhost:9001/");

describe("hacka-news", function(){
    describe("top stories", function(){
        it("should retrieve an array of top story ids from the server", function(done){
            hackaNews.requestFeedStoryIDs("top", 10, function(ids){
                should(ids).containDeepOrdered([11234589, 11235893, 11234008, 11235537, 11234739, 11235190, 11234229, 11223665, 11234840, 11234807]);
                done();
            });
        });
    });
});
