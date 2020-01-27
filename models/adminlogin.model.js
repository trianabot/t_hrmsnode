const mongoose = require('mongoose');
const Schema = mongoose.Schema;

let AdminloginModel = new Schema({

    userName:{
        type: String,
        required: true
    },
     password:{
        type: String,
        required: true
    },
    sysCreatedDate: {
        type: Number,
        required: false
    },
    sysUpdatedDate: {
        type: Number,
        required: false
    },
    socketid:{
        type: String,
        required: false
    }

});


module.exports = mongoose.model('AdminLogin',AdminloginModel);