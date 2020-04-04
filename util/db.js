var mongoose = require('mongoose');
mongoose.connect('mongodb://localhost/pics');

// auth token
var imageDataSchema = mongoose.Schema({
    myid: {
        type: String,
        unique: true,
        required: true,
        index: true
    },
    path: {
        type: String,
        index: true
    },
    width:  Number,
    height:  Number,
    created: Date,
    labels: [String]
});
var ImageData  = mongoose.model('ImageData', imageDataSchema);
exports.ImageData = ImageData;


