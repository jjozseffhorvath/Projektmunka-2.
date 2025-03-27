const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// Bővítve lesz még pár infoval, amit adatbázisban tárolni lehet, mint pl. az időpontok
const patientSchema = new Schema({
    nev: {
        type: String,
        required: true,
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
    taj: {
        type: Number,
        required: true,
        maxlength: 9
    },
    appointments: {
        dates: [Date]
    },
    resetToken: String,
    resetTokenExpiration: Date,
    isOrvos: {
        type: Boolean,
        default: false
    }
});

module.exports = mongoose.model('Patients', patientSchema);