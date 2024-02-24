const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const authController = require('../controllers/authController');




router.route('/signup').post(authController.signup);
router.route('/forgotPassword').post(authController.forgotPassword);
router.route('/login').post(authController.login);

router.use(authController.protect)


router.route('/logout').post(authController.logout);
router.route('/resetPassword/:token').patch(authController.resetPassword);
router.route('/updatePassword').patch(authController.updatePassword);
router.route('/AllUsers').get(authController.restrictTo('owner', 'trainer'), userController.paginate, userController.getAllUsers);
router.route('/users').get(userController.getUser)
router.route('/updateMe').patch(userController.updateMe)
router.route('/deleteMe').delete(userController.deleteMe)
router.route('/deleteUser').delete(authController.restrictTo('owner', 'trainer'), userController.deleteUser);
router.route('/deleteOwner').delete(authController.restrictTo('owner'), userController.deleteOwner);
router.route('/deleteTrainer').delete(authController.restrictTo('owner'), userController.deleteTrainer);


// userController.paginate

module.exports = router  