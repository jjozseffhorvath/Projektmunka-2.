const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// Itt is lesz majd bővítés, kezdésnek elegendőek ezek az adatok
const doctorSchema = new Schema({
    nev: {
        type: String,
        reuqired: true,
        maxlength: 50
    },
    email: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    resetToken: String,
    resetTokenExpiration: Date,
    isOrvos: {
        type: Boolean,
        default: true
    }
});

module.exports = mongoose.model('Orvos', doctorSchema);