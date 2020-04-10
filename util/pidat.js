var async = require('async');
var fs = require('fs');
var gm = require('gm').subClass({imageMagick: true});
var picsDir = process.env.PICS_DIR;


function processImage(imageLocation, ondonecallback) {
               gm(picsDir+"/"+imageLocation).identify(function(err, data){
                   if(err) {
                        console.log("Error when trying to read image "+imageLocation+": "+err);
                        ondonecallback();
                    }
                    else {
			    console.log(data);
                        var height = data['size']['height'];
                        var width = data['size']['width'];
                        var dateTime;
                        if (data['Properties']) {
                           if (data['Properties']['exif:DateTime']) {
                                dateTime = Date.parse(data['Properties']['exif:DateTime'].replace(':', '-').replace(':', '-').replace(' ', 'T'));
			   }
                            else if (data['Properties']['exif:GPSTimeStamp'] && data['Properties']['exif:GPSDateStamp']) {
                                var time = data['Properties']['exif:GPSTimeStamp'].replace(/\/1/g, '').replace(/,/g, ':');
                                if( time.indexOf(":") == 1 )
                                  time = '0'+time;
                                if( time.indexOf(":", 3) == 4 )
                                  time = time.substr(0,3)+'0'+time.substring(3);
                                if( time.length == 7 )
                                  time = time.substr(0,6)+'0'+time.substring(6);
                                dateTime = Date.parse(data['Properties']['exif:GPSDateStamp'].replace(/:/g, '-') + 'T' + time);
                            }
			}else if (data['Profile-EXIF']) {
                            if (data['Profile-EXIF']['Date Time']) {
                                dateTime = Date.parse(data['Profile-EXIF']['Date Time'].replace(':', '-').replace(':', '-').replace(' ', 'T'));
                            }
                            else if (data['Profile-EXIF']['GPS Time Stamp'] && data['Profile-EXIF']['GPS Date Stamp']) {
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
				console.log("date:"+dateTime);

       }
    });
}

processImage(process.argv[2], function() {
	console.log("done."); });

//  size: { width: 1440, height: 1080 },
//  'Profile-EXIF': {
//           'Date Time': '2015:03:29 11:49:04',
//     'GPS Time Stamp': '0/1,34/1,44/1',
//     'GPS Date Stamp': '2015:01:20' },
//  }
  
  
