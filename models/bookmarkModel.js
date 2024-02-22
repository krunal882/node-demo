const mongoose = require('mongoose');

const exerciseBookmarkSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    exercise: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Exercises'
    }
});

const ExerciseBookmark = mongoose.model('ExerciseBookmark', exerciseBookmarkSchema);

module.exports = ExerciseBookmark;
