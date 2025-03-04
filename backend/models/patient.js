const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// Bővítve lesz még pár infoval, amit adatbázisban tárolni lehet
const patientSchema = new Schema({
    _id: Number,
    nev: {
        type: String,
        reuqired: true,
        maxlength: 50
    }
});

module.exports = mongoose.model('Beteg', patientSchema, 'patients');