const express = require('express');
const router = express.Router();
const exerciseController = require('../controllers/exerciseController');
const authController = require('../controllers/authController');
const bookmarkController = require('../controllers/bookmarkController');

router.get('/allExercises', exerciseController.getAllExercises);
router.get('/exercises', authController.protect, exerciseController.getExercises);
router.delete('/deleteExercise', exerciseController.deleteExercise);
router.patch('/updateExercise', authController.protect, exerciseController.updateExercise);
router.post('/createExercise', authController.protect, authController.restrictTo('owner', 'trainer'), exerciseController.createExercise)
router.get('/sortExerciseByDifficulty', authController.protect, exerciseController.getExercisesByDifficulty);
router.get('/Top3Exercises', authController.protect, exerciseController.getTop3Exercises);
router.post('/bookmarkExercise', authController.protect, bookmarkController.bookmarkExercise);
router.get('/bookmarkedExercise', authController.protect, bookmarkController.getBookmarkedExercises);



module.exports = router;
