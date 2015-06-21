# pixbrix
pixbrix renders your server based picture collection in a browser. The picture are layed out as bricks.
It requires a mongo DB on your localhost and runs a node/express project to serve the pages. Furthermore you need to install imagemagick for reading EXIF data and creation of thumbnails.
## Setup
You need to configure the location of your pictures and the location which is used to store the thumbnails into. The two keys are called `PICS_DIR` and `THUMBS_DIR` (e.g. `export THUMBS_DIR=/home/fred/photos`).

After running npm install to install the required node libraries you can scan you picture collection by running
  node util/syncDB.js
You can repeat this command whenever your picture collection has changed. Only pictures not yet in the DB will be added. Existing entries are not updated. In case the picture geometry (width/height) changes the picture would need to be re-read. Maybe I should store the creation date of the entry and compare it with the modification date of the file.
The scanning can take some time because it requires reading the EXIF data of each picture.

Once the scannign is completed you can start the server as normal with
  node start
Make sure to have the system properties set.
The server is launched on port 3000.
