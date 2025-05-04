const express = require('express');
const csrf = require('csurf');
const router = express.Router();

const authController = require('../controllers/auth');
const csrfProtection = csrf({ cookie: true });

router.post('/auth/login', csrfProtection, authController.login);

router.post('/auth/signup', csrfProtection, authController.signup);

router.post('/auth/logout', authController.postLogout);

router.post('/auth/reset', csrfProtection, authController.postReset);

router.post('/auth/new-password', csrfProtection, authController.postNewPassword);

module.exports = router;