var should = require("should");
var hackaNews = require("../src/hacka-news");
var serva = require("./server/server");

hackaNews.setAPIURL("http://localhost:9001/");

describe("hacka-news", function(){
    describe("story feeds", function(){
        it("should retrieve an array of top story ids from the server", function(done){
            hackaNews.requestFeedStoryIDs("top", 10, function(err, result){
                should(err).be.eql(null);
                should(result).have.property("ids");
                should(result.ids).containDeepOrdered([11234589, 11235893, 11234008, 11235537, 11234739, 11235190, 11234229, 11223665, 11234840, 11234807]);
                done();
            });
        });
        it("should fail to retrieve an array of story ids if attempting to connect to incorrect feed type", function(done) {
            hackaNews.requestFeedStoryIDs("topp", 10, function(err, result){
                should(err).not.be.eql(null);
                should(result).be.eql(null);
                should(err).have.property("message");
                should(err.message).be.eql("ERROR: Permission denied");
                done();
            });
        });
        it("should fail to retrieve an array of story ids if host server could not be reached", function(done) {
            hackaNews.setAPIURL("http://localhost:9000/");
            hackaNews.requestFeedStoryIDs("top", 10, function(err, result){
                should(err).not.be.eql(null);
                should(result).be.eql(null);
                should(err).have.property("message");
                should(err.message).be.eql("ERROR: Connection to server refused.");
                done();
            });
            hackaNews.setAPIURL("http://localhost:9001/");
        });
    });
    describe("requesting individual stories", function(){
        it("should be able to return a JSON string of an individual story", function(done){
            hackaNews.requestStory(11234589, function(err, result){
                should(err).be.eql(null);
                should(result).have.property("storyStr");
                should(result.storyStr).be.exactly("{\n  \"by\" : \"mroling\",\n  \"descendants\" : 335,\n  \"id\" : 11234589,\n  \"kids\" : [ 11237821, 11234917, 11234688, 11235131, 11234892, 11234635, 11234860, 11237199, 11234725, 11235242, 11234865, 11235053, 11235258, 11234664, 11235433, 11235639, 11235009, 11234854, 11234748, 11234845, 11235769, 11237634, 11235851, 11235122, 11238677, 11235720, 11236034, 11235578, 11238890, 11235229, 11235200, 11237186, 11236421, 11236487, 11236245, 11235926, 11236041, 11235333, 11234644, 11235137, 11235877, 11237701, 11238417, 11235312, 11237012, 11237724, 11234651, 11236082 ],\n  \"score\" : 895,\n  \"time\" : 1457285648,\n  \"title\" : \"Transmission BitTorrent app contained malware\",\n  \"type\" : \"story\",\n  \"url\" : \"https://forum.transmissionbt.com/viewtopic.php?f=4&t=17834\"\n}\n");
                done();
            });
        });
        it("should be able to handle an invalid story id", function(done) {
            hackaNews.requestStory(0, function(err, result){
                should(err).not.be.eql(null);
                should(result).be.eql(null);
                should(err).have.property("message");
                should(err.message).be.exactly("ERROR: Couldn't retrieve JSON stringified story.");
                done();
            });
        });
        it("should fail to retrieve a story if host server could not be reached", function(done) {
            hackaNews.setAPIURL("http://localhost:9000/");
            hackaNews.requestStory(11234589, function(err, result){
                should(err).not.be.eql(null);
                should(result).be.eql(null);
                should(err).have.property("message");
                should(err.message).be.exactly("ERROR: Connection to server refused.");
                done();
            });
            hackaNews.setAPIURL("http://localhost:9001/");
        });
    });
    describe("HN comment requests", function(){
        it("should be able to request for root parent of a comment", function(done){
            hackaNews.requestStory(2921983, function(err, result){
                should(err).be.eql(null);
                should(result).have.property("storyStr");
                var parsed = hackaNews.parseStory(result.storyStr);
                hackaNews.requestRootParent(parsed, function(err, result){
                    should(err).be.eql(null);
                    should(result).containDeep({
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
    describe("HN poll options requests", function(){
        it("should request for all poll options of a poll post and arrange it into an array of poll options", function(done){
            hackaNews.requestStoryParsed(126809, function(err, result){
                should(err).be.eql(null);
                hackaNews.requestPollOptions(result, function(err, result){
                    should(err).be.eql(null);
                    should(result.pollOpts[0].id).equal(126810);
                    should(result.pollOpts[1].id).equal(126811);
                    should(result.pollOpts[2].id).equal(126812);
                    done();
                });
            });
        });
    });
    describe("HN post url", function(){
        it("should be able to return a properly formatted url for HN post id", function(){
            var urlStr = hackaNews.getURL("1");
            should(urlStr).be.exactly("https://news.ycombinator.com/item?id=1");
        })
    });
    describe("parsing story", function(){
        it("should be able to parse an individual story JSON string", function(){
            var parsedStory = hackaNews.parseStory("{\n  \"by\" : \"mroling\",\n  \"descendants\" : 335,\n  \"id\" : 11234589,\n  \"kids\" : [ 11237821, 11234917, 11234688, 11235131, 11234892, 11234635, 11234860, 11237199, 11234725, 11235242, 11234865, 11235053, 11235258, 11234664, 11235433, 11235639, 11235009, 11234854, 11234748, 11234845, 11235769, 11237634, 11235851, 11235122, 11238677, 11235720, 11236034, 11235578, 11238890, 11235229, 11235200, 11237186, 11236421, 11236487, 11236245, 11235926, 11236041, 11235333, 11234644, 11235137, 11235877, 11237701, 11238417, 11235312, 11237012, 11237724, 11234651, 11236082 ],\n  \"score\" : 895,\n  \"time\" : 1457285648,\n  \"title\" : \"Transmission BitTorrent app contained malware\",\n  \"type\" : \"story\",\n  \"url\" : \"https://forum.transmissionbt.com/viewtopic.php?f=4&t=17834\"\n}\n");
            should(parsedStory).containDeep({
                by : "mroling",
                descendants : 335,
                id : 11234589,
                kids : [ 11237821, 11234917, 11234688, 11235131, 11234892, 11234635, 11234860, 11237199, 11234725, 11235242, 11234865, 11235053, 11235258, 11234664, 11235433, 11235639, 11235009, 11234854, 11234748, 11234845, 11235769, 11237634, 11235851, 11235122, 11238677, 11235720, 11236034, 11235578, 11238890, 11235229, 11235200, 11237186, 11236421, 11236487, 11236245, 11235926, 11236041, 11235333, 11234644, 11235137, 11235877, 11237701, 11238417, 11235312, 11237012, 11237724, 11234651, 11236082 ],
                score : 895,
                time : 1457285648,
                title : "Transmission BitTorrent app contained malware",
                type : "story",
                url : "https://forum.transmissionbt.com/viewtopic.php?f=4&t=17834"
            });
        });
    });
    describe("story injections", function(){
        it("should be able to inject comments URL into the story", function(done){
            var parsedStory = hackaNews.parseStory("{\n  \"by\" : \"mroling\",\n  \"descendants\" : 335,\n  \"id\" : 11234589,\n  \"kids\" : [ 11237821, 11234917, 11234688, 11235131, 11234892, 11234635, 11234860, 11237199, 11234725, 11235242, 11234865, 11235053, 11235258, 11234664, 11235433, 11235639, 11235009, 11234854, 11234748, 11234845, 11235769, 11237634, 11235851, 11235122, 11238677, 11235720, 11236034, 11235578, 11238890, 11235229, 11235200, 11237186, 11236421, 11236487, 11236245, 11235926, 11236041, 11235333, 11234644, 11235137, 11235877, 11237701, 11238417, 11235312, 11237012, 11237724, 11234651, 11236082 ],\n  \"score\" : 895,\n  \"time\" : 1457285648,\n  \"title\" : \"Transmission BitTorrent app contained malware\",\n  \"type\" : \"story\",\n  \"url\" : \"https://forum.transmissionbt.com/viewtopic.php?f=4&t=17834\"\n}\n");
            hackaNews.injectStoryExtras(parsedStory, function(err){
                should(err).be.eql(null);
                should.exist(parsedStory.commentsUrl);
                should(parsedStory.commentsUrl).be.exactly("https://news.ycombinator.com/item?id=11234589");
                done();
            });
        });
        it("should be able to inject the root parent into a comment post", function(done){
            hackaNews.requestStory(2921983, function(err, result){
                should(err).be.eql(null);
                var parsedStory = hackaNews.parseStory(result.storyStr);
                hackaNews.injectStoryExtras(parsedStory, function(err){
                    should(err).be.eql(null);
                    should.exist(parsedStory.rootParent);
                    should(parsedStory.rootParent.id).equal(2921506);
                    done();
                });
            });
        });
        it("should return an error if attempting to inject an invalid root parent into a comment post", function(done) {
            should.fail();
        });
        it("should be able to inject poll options into a poll post", function(done){
            hackaNews.requestStory(126809, function(err, result){
                should(err).be.eql(null);
                var parsedStory = hackaNews.parseStory(result.storyStr);
                hackaNews.injectStoryExtras(parsedStory, function(err){
                    should(err).be.eql(null);
                    should.exist(parsedStory.partNodes);
                    should(parsedStory.partNodes[0].id).equal(126810);
                    should(parsedStory.partNodes[1].id).equal(126811);
                    should(parsedStory.partNodes[2].id).equal(126812);
                    done();
                })
            });
        });
        it("should return an error if attempting to inject invalid poll options into a poll post", function(done) {
            should.fail();
        });
    });
    describe("story groups", function() {
        it("should be able to take in an array of story IDs and return the appropriate parsed stories", function(done) {
            should.fail();
        });
        it("should fail if an empty array is passed in", function(done) {
            should.fail();
        });
        it("should fail if null is passed as the ID array", function(done) {
            should.fail();
        });
        it("should fail if connection timed out", function(done) {
            should.fail();
        });
        it("should fail if a story in the group is invalid", function(done) {
            should.fail();
        });
    });
});
