var should = require("should");
var hackaNews = require("../src/hacka-news");
var serva = require("./server/server");

hackaNews.setAPIURL("http://localhost:9001/");

describe("hacka-news", function(){
    describe("story feeds", function(){
        it("should retrieve an array of top story ids from the server.", function(done){
            hackaNews.requestFeedStoryIDs("top", 10, function(ids){
                should(ids).containDeepOrdered([11234589, 11235893, 11234008, 11235537, 11234739, 11235190, 11234229, 11223665, 11234840, 11234807]);
                done();
            });
        });
    });
    describe("requesting individual stories", function(){
        it("should be able to return a JSON string of an individual story.", function(done){
            hackaNews.requestStory(11234589, function(jsonStr){
                should(jsonStr).be.exactly("{\n  \"by\" : \"mroling\",\n  \"descendants\" : 335,\n  \"id\" : 11234589,\n  \"kids\" : [ 11237821, 11234917, 11234688, 11235131, 11234892, 11234635, 11234860, 11237199, 11234725, 11235242, 11234865, 11235053, 11235258, 11234664, 11235433, 11235639, 11235009, 11234854, 11234748, 11234845, 11235769, 11237634, 11235851, 11235122, 11238677, 11235720, 11236034, 11235578, 11238890, 11235229, 11235200, 11237186, 11236421, 11236487, 11236245, 11235926, 11236041, 11235333, 11234644, 11235137, 11235877, 11237701, 11238417, 11235312, 11237012, 11237724, 11234651, 11236082 ],\n  \"score\" : 895,\n  \"time\" : 1457285648,\n  \"title\" : \"Transmission BitTorrent app contained malware\",\n  \"type\" : \"story\",\n  \"url\" : \"https://forum.transmissionbt.com/viewtopic.php?f=4&t=17834\"\n}\n");
                done();
            });
        });
    });
    describe("HN post url", function(){
        it("should be able to return a properly formatted url for HN post id.", function(){
            var urlStr = hackaNews.getURL("1");
            should(urlStr).be.exactly("https://news.ycombinator.com/item?id=1");
        })
    });
    describe("HN comment requests", function(){
        it("should be able to request for root parent of a comment.", function(done){
            hackaNews.requestStory(2921983, function(jsonStr){
                var parsed = hackaNews.parseStory(jsonStr);
                hackaNews.requestRootParent(parsed, function(parsed){
                    should(parsed).containDeep({
                      by : "mayoff",
                      descendants : 31,
                      id : 2921506,
                      kids : [ 2921983, 2921798, 2922112, 2921758, 2921764, 2922038, 2923109, 2922107, 2921923, 2922398, 2921875 ],
                      score : 226,
                      text : "",
                      time : 1314205301,
                      title : "Peter Norvig on a 45-year-old article about a checkers-playing program",
                      type : "story",
                      url : "http://blogs.scientificamerican.com/at-scientific-american/2011/08/23/systems-analysis-look-back-1966-scientific-american-article/",
                      commentsUrl : "https://news.ycombinator.com/item?id=2921506"
                    });
                    done();
                });
            });
        });
    });
});
