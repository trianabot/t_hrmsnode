const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const userroleSchema = new Schema({
    companyId: { type: String, required: true, unique: true },
    empName: { type: String, required: true },
    dateofbirth: { type: Date},
    address1: { type: String, required: true },
    // address2: { type: String, required: true },
    city: { type: String, required: true },
    emailId: { type: String, required: true , unique: true},
    phone: { type: String, required: true },
    mobile: { type: String, required: true, unique: true },
    emergency: { type: String, required: true },
    panNumber: { type: String, required: true, unique: true },
    aadhaarNo: { type: String , unique: true},
   joinDate: { type: Date},
    bankAccount: { type: Number , unique: true},
    ess: { type: String },
    confirmation: { type: String },
    pfUan: { type: String },
    pfNumber: { type: String },
    pfEnroleDate: { type: Date },
    epfNumber: { type: String },
    esiNumber: { type: String },
    ctc: { type: String },
    fbp: { type: String },
    variablePay: { type: String },
    total: { type: String },
    differenceAmount: { type: String },
    productType: { type: String },
    taxStatus: { type: String },
    state: { type: String },
    gender: { type: String },
    jobType: { type: String },
    paymentMode: { type: String },
    location: { type: String },
    department: { type: String },
    Designation: { type: String },
    Relationship: { type: String },
    CreatedOn: {
        type: Date,
        default: Date.now
    },
    UpdatedOn: {
        type: Date,
        default: Date.now
    },

});

module.exports = mongoose.model('onbording_collection',userroleSchema);


