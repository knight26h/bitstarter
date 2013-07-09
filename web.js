var express = require('express');
var fs = require('fs');
var path = require('path');
var infile = "index.html";
var fd = fs.readFileSync(infile,'utf8');

//console.log(fd);

var app = express.createServer(express.logger());
app.use(express.static(path.join( __dirname,'bootstrap')));

app.get('/', function(request, response) {
  response.send( fd.toString() );
});

var port = process.env.PORT || 5000;
app.listen(port, function() {
  console.log("Listening on " + port);
});
