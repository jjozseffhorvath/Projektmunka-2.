const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// Bővítve lesz még pár infoval, amit adatbázisban tárolni lehet, mint pl. az időpontok
const patientSchema = new Schema({
    name: {
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
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Appointments'
    },
    resetToken: String,
    resetTokenExpiration: Date
});

module.exports = mongoose.model('Patients', patientSchema);