const ExerciseBookmark = require('../models/bookmarkModel');

exports.bookmarkExercise = async (req, res) => {
    try {
        const { id } = req.query;
        const userId = req.user.id;

        const existingBookmark = await ExerciseBookmark.findOne({ user: userId, exercise: id });

        if (existingBookmark) {
            return res.status(400).json({ error: 'Exercise already bookmarked' });
        }

        await ExerciseBookmark.create({ user: userId, exercise: id });

        res.status(200).json({ status: 'success' });
    } catch (error) {
        console.error('Error bookmarking exercise:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};


exports.getBookmarkedExercises = async (req, res) => {
    try {
        const userId = req.user.id;

        const bookmarkedExercises = await ExerciseBookmark.find({ user: userId }).populate('exercise');

        if (bookmarkedExercises.length === 0) {
            return res.status(200).json({ status: 'success', message: 'No bookmarked exercises found' });
        }

        res.status(200).json({ status: 'success', data: bookmarkedExercises });
    } catch (error) {
        console.error('Error retrieving bookmarked exercises:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};




exports.undoBookmark = async (req, res) => {
    try {
        const { id } = req.query;
        const userId = req.user.id;

        const existingBookmark = await ExerciseBookmark.findOneAndDelete({ user: userId, exercise: id });

        if (!existingBookmark) {
            return res.status(404).json({ error: 'Exercise bookmark not found' });
        }
        res.status(200).json({ status: 'success' });
    } catch (error) {
        console.error('Error undoing exercise bookmark:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};
