var express = require('express');
var http = require('http');
var https = require('https');
var url = require("url");
var app = express();

var validHosts = ["imgur.com", "hizliresim.com", "pbs.twimg.com", "postimg.org", "tinypic.com"];

app.get("/", function (request, response) {
  var requestUrl = request.query.url;
  if(!requestUrl){
    response.statusCode = 400;
    response.end();
    return;
  }
  
  var parsedUrl = url.parse(requestUrl);
  var hostname = parsedUrl.hostname.split('.').slice(-2).join('.');
  if(validHosts.indexOf(parsedUrl.hostname) === -1 && validHosts.indexOf(hostname) === -1){
    response.statusCode = 400;
    response.end();
    return;
  }
  var options = {"host": parsedUrl.host, 
    "path": parsedUrl.path, 
    "port": parsedUrl.port
  };
  if(request.headers["if-modified-since"] && request.headers['if-none-match']){
    options.headers = {'if-modified-since': request.headers["if-modified-since"],
      'if-none-match': request.headers['if-none-match']
    };
  }
  var client = getRequestClient(parsedUrl);
  client.get(options, function(res) {
    /*
    var contentType = res.headers['content-type'];
    if(contentType.indexOf('image/') === -1){
      response.statusCode = 400;
      response.end(requestUrl + " is not an image.");
      return;
    }
    */
    
    setHeader(response, res, 'content-type');
    setHeader(response, res, 'content-length');
    setHeader(response, res, 'cache-control');
    setHeader(response, res, 'etag');
    setHeader(response, res, 'expires');
    setHeader(response, res, 'last-modified');
        
    if(res.statusCode === 304){
      response.statusCode  = 304;
    }
    
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

function getRequestClient(parsedUrl){
  if(parsedUrl.protocol === 'https')
    return https;
  else
    return http;
}

function setHeader(mainResponse, innerResponse, headerKey){
    if(innerResponse.headers[headerKey]){
      mainResponse.setHeader(headerKey, innerResponse.headers[headerKey]);
    }
}

app.get("/echo", function (request, response) {
  response.end("OK");
});

var listener = app.listen(process.env.PORT, function () {
  console.log('Your app is listening on port ' + listener.address().port);
});
