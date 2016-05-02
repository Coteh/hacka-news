const NUM_SECONDS_IN_MINUTE = 60;
const NUM_SECONDS_IN_HOUR = 3600;
const NUM_SECONDS_IN_DAY = 86400;
const NUM_SECONDS_IN_WEEK = 604800;
const NUM_SECONDS_IN_MONTH = 2592000; //average amount of days in month: 30
const NUM_SECONDS_IN_YEAR = 31536000; //going by 365 days in a year

exports.getNowTime = function(){
    return Math.floor((new Date()).getTime() / 1000); //takes current time then converts from milliseconds to seconds
}

exports.getTimeStringFromEpoch = function(timeval) {
    var now = this.getNowTime();
    var timeDelta = now - timeval;
    var timeDeltaAbs = Math.abs(timeDelta);
    var timeNum = 0;
    var timeStr = null;
    if (timeDeltaAbs < NUM_SECONDS_IN_MINUTE) {
        timeNum = timeDelta;
        timeStr = "second";
    }else if (timeDeltaAbs < NUM_SECONDS_IN_HOUR){
        timeNum = Math.floor(timeDelta / NUM_SECONDS_IN_MINUTE);
        timeStr = "minute";
    }else if (timeDeltaAbs < NUM_SECONDS_IN_DAY){
        timeNum = Math.floor(timeDelta / NUM_SECONDS_IN_HOUR);
        timeStr = "hour";
    }else if (timeDeltaAbs < NUM_SECONDS_IN_WEEK){
        timeNum = Math.floor(timeDelta / NUM_SECONDS_IN_DAY);
        timeStr = "day";
    }else if (timeDeltaAbs < NUM_SECONDS_IN_MONTH){
        timeNum = Math.floor(timeDelta / NUM_SECONDS_IN_WEEK);
        timeStr = "week";
    }else if (timeDeltaAbs < NUM_SECONDS_IN_YEAR){
        timeNum = Math.floor(timeDelta / NUM_SECONDS_IN_MONTH);
        timeStr = "month";
    }else{
        timeNum = Math.floor(timeDelta / NUM_SECONDS_IN_YEAR);
        timeStr = "year";
    }
    timeStr += ((timeNum == 1) ? "" : "s");
    return timeNum + " " + timeStr + " ago";
}
