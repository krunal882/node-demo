const express = require('express');
const router = express.Router();
const exerciseController = require('../controllers/exerciseController');
const authController = require('../controllers/authController');
const bookmarkController = require('../controllers/bookmarkController');


router.use(authController.protect);

router.get('/allExercises', exerciseController.getAllExercises);
router.get('/exercises', exerciseController.getExercises);
router.post('/createExercise', authController.restrictTo('owner', 'trainer'), exerciseController.createExercise);
router.patch('/updateExercise', authController.restrictTo('owner', 'trainer'), exerciseController.updateExercise);
router.delete('/deleteExercise', authController.restrictTo('owner', 'trainer'), exerciseController.deleteExercise);
router.get('/sortExerciseByDifficulty', exerciseController.getExercisesByDifficulty);
router.get('/Top3Exercises', exerciseController.getTop3Exercises);
router.post('/bookmarkExercise', bookmarkController.bookmarkExercise);
router.delete('/undoBookmark', bookmarkController.undoBookmark);
router.get('/bookmarkedExercise', bookmarkController.getBookmarkedExercises);



module.exports = router;
