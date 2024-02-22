const ExerciseBookmark = require('../models/bookmarkModel');


exports.bookmarkExercise = async (req, res) => {
    try {
        const { id } = req.query;
        const userId = req.user.id; // Assuming user ID is available in request

        // Check if the exercise is already bookmarked by the user
        const existingBookmark = await ExerciseBookmark.findOne({ user: userId, exercise: id });

        if (existingBookmark) {
            // Exercise is already bookmarked by the user
            return res.status(400).json({ error: 'Exercise already bookmarked' });
        }

        // Create a new ExerciseBookmark document
        await ExerciseBookmark.create({ user: userId, exercise: id });

        res.status(200).json({ status: 'success' });
    } catch (error) {
        console.error('Error bookmarking exercise:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};


// Endpoint to retrieve bookmarked exercises for a user
exports.getBookmarkedExercises = async (req, res) => {
    try {
        const userId = req.user.id; // Assuming user ID is available in request
        // Retrieve exercises bookmarked by the user
        const bookmarkedExercises = await ExerciseBookmark.find({ user: userId }).populate('exercise');

        res.status(200).json({ status: 'success', data: bookmarkedExercises });
    } catch (error) {
        console.error('Error retrieving bookmarked exercises:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};
