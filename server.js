var express = require('express');
var http = require('http');
var https = require('https');
var app = express();

app.get("/", function (request, response) {
  var url = request.query.url;
  
  var client = getRequestClient(url);
  client.get(url, function(res) {
    var contentType = res.headers['content-type'];
    if(contentType.indexOf('image/') === -1){
      response.statusCode = 400;
      response.end(url + " is not an image.");
      return;
    }
    
    response.setHeader('Content-Type', res.headers['content-type']);
    response.setHeader('Content-Length', res.headers['content-length']);
    
    res.on("data", function(chunk) {
      response.write(chunk);
    });
    
    res.on("end", function(chunk) {
      response.end();
    });
  }).on('error', function(e) {
    response.statusCode = 500;
    response.end(e.message);
  });
});

function getRequestClient(url){
  if(url.indexOf('https://') === 0)
    return https;
  else
    return http;
}

var listener = app.listen(process.env.PORT, function () {
  console.log('Your app is listening on port ' + listener.address().port);
});
