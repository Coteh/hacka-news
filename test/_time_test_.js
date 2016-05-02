var should = require("should");
var hackaTime = require("../src/hacka-time");

//Mock the getNowTime function inside hacka-time.js
hackaTime.getNowTime = function(){
    return 1462225681;
};

describe("hacka-time", function(){
    describe("time string", function(){
        it("should return the correct amount of time that has passed since the timestamp.", function(){
            var str = hackaTime.getTimeStringFromEpoch(1462205466);

            should(str).be.exactly("5 hours ago");
        });
    });
});
