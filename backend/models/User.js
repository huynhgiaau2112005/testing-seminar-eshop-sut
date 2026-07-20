// models/User.js
const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
    name: String,
    email: String,
    phone: String,
    password: String,
    imageUrl: String
}, { timestamps: true });

module.exports = mongoose.model('User', UserSchema);