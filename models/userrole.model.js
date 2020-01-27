const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const userroleSchema = new Schema({
    roleId: { type: String, required: true },
    role: { type: String, required: true }
});

module.exports = mongoose.model('userrole',userroleSchema);