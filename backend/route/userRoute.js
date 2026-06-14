const express = require('express');
const router = express.Router();
const UserController = require('../controller/userContoller');
const auth = require('../middelware/auth');
router.post('/signup', UserController.signup);
router.post('/login', UserController.login);
router.get('/profile',auth,UserController.getProfile);
router.put('/updateprofile',auth,UserController.updateProfile);
router.put('/changepassword',auth,UserController.changePassword);
router.post('/forgetpassword',UserController.forgetPassword);
router.post("/verify-otp", UserController.verifyOTP)
router.post("/resetpassword", UserController.resetPassword)

module.exports = router;
