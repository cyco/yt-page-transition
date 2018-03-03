var Http = require("http");
var Path = require("path");
var FS = require("fs");

Http.createServer(function(req, res) {
    var filePath = "." + req.url;
    if (filePath == "./") filePath = "./page-1.html";

    var extname = Path.extname(filePath);
    var contentType = mimeTypeForExtension(extname);

    FS.readFile(filePath, function(error, content) {
        setTimeout(function() {
            if(error) {
                res.writeHead(404, { "Content-Type": 'text/plain' });
                res.end(error.message, "utf-8");
                return;
            }

            res.writeHead(200, { "Content-Type": contentType });
            res.end(content, "utf-8");
        }, 300 + Math.random() * 1000);
    });
}).listen(8080);

console.log("Listening on port 8080");

function mimeTypeForExtension(extension) {
    switch (extension) {
        case ".js":
            return "text/javascript";
        case ".css":
            return "text/css";
        case ".htm":
        case ".html":
            return "text/html";
        default:
            return "text/plain";
    }
}
