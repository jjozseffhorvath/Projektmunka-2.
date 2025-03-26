const express = require('express');
const router = express.Router();

const authController = require('../controllers/auth');

router.get('/auth/login', authController.getLogin);

router.get('/auth/signup', authController.getSignup);

router.get('/auth/reset', authController.getReset);

router.get('/auth/reset/:token', authController.getNewPassword);

router.post('/auth/login', authController.postLogin);

router.post('/auth/signup', authController.postSignup);

router.post('/auth/logout', authController.postLogout);

router.post('/auth/reset', authController.postReset);

router.post('/auth/new-password', authController.postNewPassword);

module.exports = router;