var async = require('async');
var fs = require('fs');
var db = require('./db');
var gm = require('gm').subClass({imageMagick: true});
var picsDir = process.env.PICS_DIR;

function isPic(filename) {
    if( filename.toLowerCase().substring(filename.length-4, filename.length) === '.jpg' ||
            filename.toLowerCase().substring(filename.length-5, filename.length) === '.jpeg' )
        return true;
    return false;
}


function getPics(path, recursive) {
        var files = fs.readdirSync(picsDir + "/" + path);
            for (var i = 0; i < files.length; i++) {
                if (files[i].substring(0, 1) === ".")
                  continue;
                var stats = fs.statSync(picsDir + "/" + path+ "/" +files[i]);
                if( stats.isDirectory() && recursive) {
                  getPics((path?path+"/":"")+files[i], true);
                }
                else if (stats.isFile() && isPic(files[i])) {
                  processImageQueue.push((path?path+"/":"")+files[i]);
                }
            }
}

function processImage(imageLocation, ondonecallback) {
    db.ImageData.findOne({'myid': imageLocation}, function(err, imageData) {
       if(err) {
           console.log("Error when trying to access imagedata: "+err);
           ondonecallback();
       }
       else {
           if( imageData ) {
               console.log("Image already created in DB: "+imageLocation);
               ondonecallback();
           }
           else {
               gm(picsDir+"/"+imageLocation).identify(function(err, data){
                   if(err) {
                        console.log("Error when trying to read image "+imageLocation+": "+err);
                        ondonecallback();
                    }
                    else {
                        var height = data['size']['height'];
                        var width = data['size']['width'];
                        var dateTime;
                        if (data['Profile-EXIF']) {
                            if (data['Profile-EXIF']['Date Time']) {
                                dateTime = Date.parse(data['Profile-EXIF']['Date Time'].replace(':', '-').replace(':', '-').replace(' ', 'T'));
                            }
                            else if (data['Profile-EXIF']['GPS Time Stamp'] && data['Profile-EXIF']['GPS Date Stamp']) {
                                // handling of GPS time stamps looks complicated, there must be a more simple way...
                                //     'GPS Time Stamp': '0/1,34/1,44/1',
                                //     'GPS Date Stamp': '2015:01:20' },
                                var time = data['Profile-EXIF']['GPS Time Stamp'].replace(/\/1/g, '').replace(/,/g, ':');
                                if( time.indexOf(":") == 1 )
                                  time = '0'+time;
                                if( time.indexOf(":", 3) == 4 )
                                  time = time.substr(0,3)+'0'+time.substring(3);
                                if( time.length == 7 )
                                  time = time.substr(0,6)+'0'+time.substring(6);
                                dateTime = Date.parse(data['Profile-EXIF']['GPS Date Stamp'].replace(/:/g, '-') + 'T' + time);
                            }
                        }
                        var path = "";
                        if( imageLocation.lastIndexOf("/") != -1 )
                            path = imageLocation.substring(0, imageLocation.lastIndexOf("/"));
                        imageData = db.ImageData({
                            'myid': imageLocation,
                            'path': path,
                            'height': height,
                            'width': width,
                            'created': dateTime
                        });
                        imageData.save(function(err) {
                            if (err) {
                                console.log("Could not store image data to DB: " + err);
                            }
                            else {
                                console.log("Created image data for " + imageLocation);
                            }
                            ondonecallback();
                        });
                    }
               });
           }
       }
    });
}

var processImageQueue = async.queue(processImage, 5);
processImageQueue.drain = function() {
    console.log("all done.");
    process.exit();
};

if( ! picsDir ) {
  console.log("System environment variable PICS_DIR is not set!");
  process.exit(1);
}
getPics("", true);


//  size: { width: 1440, height: 1080 },
//  'Profile-EXIF': {
//           'Date Time': '2015:03:29 11:49:04',
//     'GPS Time Stamp': '0/1,34/1,44/1',
//     'GPS Date Stamp': '2015:01:20' },
//  }
  
  
