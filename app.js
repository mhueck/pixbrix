var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');

// custom
var db = require('./util/db');
var pics = require('./routes/pics');

// check if directories are configured
if( !process.env.PICS_DIR || !process.env.THUMBS_DIR ) {
  console.log("System environment variable PICS_DIR or THUMBS_DIR are not set!");
  process.exit(1);
}

// configure express
var app = express();
// uncomment after placing your favicon in /public
//app.use(favicon(__dirname + '/public/favicon.ico'));
app.use(logger('dev'));
app.use(express.static(path.join(__dirname, 'public')));

// store common resources to request for access by routes
app.use(function(req, res, next) {
    req.logger = logger;
    req.db = db;
    req.logger('request initialized');
    next();
});

app.use('/', pics);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  console.log("404 not found");
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

// error handlers

app.use(function(err, req, res, next) {
    console.log("ERROR occurred: "+err.message);
    res.status(err.status || 500);
    res.send('error message '+ err.message + '. Error: ' + err);
});


module.exports = app;
