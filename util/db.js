var mongoose = require('mongoose');
mongoose.connect('mongodb://nostromo/pics');

// auth token
var imageDataSchema = mongoose.Schema({
    _id: {
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


