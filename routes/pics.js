var fs = require('fs');
var path = require('path');
var express = require('express');
var gm = require('gm').subClass({imageMagick: true});
var router = express.Router();
var picsDir = process.env.PICS_DIR;
var thumbsDir = process.env.THUMBS_DIR;

fs.mkdirParent = function(dirPath, mode, callback) {
  //Call the standard fs.mkdir
  fs.mkdir(dirPath, mode, function(error) {
    //When it fail in this way, do the custom steps
  if (error && error.errno ) {
      //Create all the parents recursively
      fs.mkdirParent(path.dirname(dirPath), mode, null);
      //And then the directory
      fs.mkdirParent(dirPath, mode, null);
    }
    //Manually run the callback since we used our own callback to do all these
    if( callback )
      callback(error);
  });
};

router.get('/tree', function(req, res, next) {
  req.db.ImageData.aggregate([{
        $group: {
          '_id': '$path',
          'pics': { $sum : 1}
        }
    }, {
      $sort: { '_id': 1 }
    }], function(err, ar) {
      if( err) {
       console.log("err: "+err);
       res.status(500).send();
      }
      else {
        res.json(ar);
      }
  });
});

router.get('/browse/:path(*)', function(req, res, next) {
  req.db.ImageData.find({ 'path': req.params.path }).sort({'created': 1}).exec(function(err, ids) {
    res.json(ids);
  });
});

function createDirAndThumb(orig, thumb, resolution, callback) {

  var dirs = thumb.substring(0, thumb.lastIndexOf("/"));
  fs.stat(dirs, function(err) {
    if( err )
      fs.mkdirParent(dirs, 0775, function(err) {
        createThumb(orig, thumb, resolution, callback);
      });
    else
      createThumb(orig, thumb, resolution, callback);
  });
    
}

function createThumb(orig, thumb, resolution, callback) {
  gm(orig).thumb(resolution, 0, thumb, 85, function (err, stdout, stderr) {
    if( err )
      callback(err);
    else
      callback();
  });
}

router.get('/thumb/:resolution/:path(*)', function(req, res, next) {
    var path = req.params.path;
    var resolution = req.params.resolution;
  if(path.indexOf("..") != -1 ) {
      console.log("Invalid path: " + path);
    res.status(400).send("Invalid path");
    return;
  }
  if(! resolution.match('^[1-8]00px$')) {
      console.log("Invalid resolution: " + resolution);
    res.status(400).send("Invalid resolution");
    return;
  }
  fs.stat(thumbsDir+"/"+resolution+"/"+path, function(err, thumbFile) {
    if( ! err )
      res.sendFile(thumbsDir+"/"+resolution+"/"+path);
    else {
      createDirAndThumb(picsDir+"/"+path, thumbsDir+"/"+resolution+"/"+path, parseInt(resolution), function (err) {
        if( err ) {
          console.log("error creating thumb: "+err);
          res.status(500).send("Internal error");
        }
        else {
            console.log("Delivering: "+thumbsDir + "/" + resolution + "/" + path);
            res.sendFile(thumbsDir + "/" + resolution + "/" + path);
        }
      });
    }
  });
});

router.get('/pic/:path(*)', function(req, res, next) {
  if(req.params.path.indexOf("..") != -1 ) {
    res.status(500).send("Invalid path");
    return;
  }
    res.sendFile(picsDir+"/"+req.params.path);
});

module.exports = router;
