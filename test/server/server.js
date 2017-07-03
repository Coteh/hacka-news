var http = require('http');
var fs = require('fs');
var path = require('path');
var url = require('url');
var port = 9001;

var deniedList = [
    "/toppstories.json"
];

var hasPermission = function(pathName) {
    for (var i = 0; i < deniedList.length; i++) {
        if (pathName.indexOf(deniedList[i]) >= 0) {
            return false;
        }
    }
    return true;
};

http.createServer(function(request, response){

    var uri = url.parse(request.url, true);
    var pathName = uri.pathname;
    var filePath = path.join(__dirname, pathName);
    var printMode = uri.query.print;
    var jsonContents = null;
    var contentType = 'application/json';

    if (!hasPermission(pathName)) {
        response.writeHead(401, {"Content-Type" : "application/json"});
        response.write(JSON.stringify({error: "Permission denied"}));
        response.end();
        return;
    }

  fs.exists(filePath, function(exists) {
    if (!exists){
        if (pathName.indexOf("/item/") < 0) {
            response.writeHead(404, {"Content-Type" : "text/plain"});
        }
        response.write("null\n");
        response.end();
        return;
    }

    if (fs.statSync(filePath).isDirectory()){
        filePath += "/index.html";
    }

    fs.readFile(filePath, function(error, content) {
        if (error){
            if (error.code == 'ENOENT'){
                response.writeHead(404, {"Content-Type" : "text/plain"});
                response.write(error + "\n");
                response.end();
            }else{
                response.writeHead(500, {"Content-Type" : "text/plain"});
                response.write(error + "\n");
                response.end();
            }
        }else{
            response.writeHead(200, {"Content-Type" : contentType});
            response.end(content, 'utf-8');
        }
    });

    //Load the json from file
    jsonContents = fs.readFileSync(filePath, {encoding: 'utf-8'});

    //Write the contents to the response
    response.write(jsonContents);
    response.end();
  });

}).listen(port);

console.log("Server running at http://localhost:" + port + ".\nPress CTRL+C to shutdown the server.");
