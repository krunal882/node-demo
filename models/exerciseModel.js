const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const exerciseSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Please provide the exercise name']
    },
    type: {
        type: String,
        required: [true, 'Please provide the type of exercise'],
        enum: ['strength', 'cardio', 'weightlifting', 'powerlifting', 'stretching']
    },

    muscle: {
        type: String,
        required: [true, 'Please provide the muscle targeted by the exercise'],
        enum: ['biceps', 'calves', 'chest', 'forearms', 'hamstrings', 'lats', 'lower_back', 'middle_back', 'neck', 'traps', 'triceps']
    },

    equipment: {
        type: String,
    },
    difficulty: {
        type: String,
        enum: ['beginner', 'intermediate', 'expert'],
        default: 'intermediate'
    },
    category: {
        type: String,
        enum: ['favorite']
    },
    instructions: {
        type: String,
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }

});

const Exercises = mongoose.model('Exercises', exerciseSchema);

module.exports = Exercises;
