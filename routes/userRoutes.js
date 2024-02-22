const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const authController = require('../controllers/authController');

router.route('/signup').post(authController.signup);
router.route('/forgotPassword').post(authController.forgotPassword);
router.route('/login').post(authController.login);
// router.route('/logout').post(authController.protect, authController.logout);
router.route('/resetPassword/:token').patch(authController.protect, authController.resetPassword);
router.route('/updatePassword').patch(authController.protect, authController.updatePassword);
router.route('/AllUsers').get(authController.protect, authController.restrictTo('owner', 'trainer'), userController.paginate, userController.getAllUsers);
router.route('/users').get(authController.protect, userController.getUser)
router.route('/updateMe').post(authController.protect, userController.updateMe)
router.route('/deleteMe').delete(authController.protect, userController.deleteMe)
router.route('/deleteUser').delete(authController.protect, authController.restrictTo('owner', 'trainer'), userController.deleteUser);
router.route('/deleteOwner').delete(authController.protect, authController.restrictTo('owner'), userController.deleteOwner);
router.route('/deleteTrainer').delete(authController.protect, authController.restrictTo('owner'), userController.deleteTrainer);




module.exports = router 