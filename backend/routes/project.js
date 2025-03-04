const express = require('express');
const router = express.Router();
const Beteg = require('../models/patient');

router.get('/', function(req, res, next) {
    Beteg
    .find()
    .then(patients => {
        res.status(200).json(patients);
    })
});

module.exports = router;