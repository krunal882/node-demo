const Exercise = require('../models/exerciseModel');


exports.getAllExercises = async (req, res) => {
    try {
        // Check if pagination is needed
        if (!req.query.page && !req.query.limit) {
            // If pagination is not needed, simply fetch all users
            const exercises = await Exercise.find();
            res.json(exercises);
        }
    } catch (error) {
        console.error('Error fetching exercises:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};
exports.getExercises = async (req, res) => {
    try {
        const { muscle, type, name, difficulty, equipment, id } = req.query;
        const filter = {};
        const allowedParams = ['muscle', 'type', 'name', 'difficulty', 'equipment'];
        let exercises;

        if (req.query.id) {
            exercises = await Exercise.findById(req.query.id);
        }
        allowedParams.forEach(async param => {
            if (req.query[param]) {
                filter[param] = req.query[param];
                exercises = await Exercise.find(filter);
            }
        });
        res.json(exercises);
    } catch (error) {
        console.error('Error fetching exercises:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};


exports.createExercise = async (req, res) => {
    try {
        const { name, type, muscle, equipment, difficulty } = req.body;

        // Check if the email already exists in the database
        const existingExercise = await Exercise.findOne({ name });
        if (existingExercise) {
            return res.status(400).json({ error: 'Exercise is already available' });
        }

        // Create the new user
        const newExercise = await Exercise.create({ name, type, muscle, equipment, difficulty });

        // Send token and user data in response
        res.status(201).json({
            status: 'success',
            data: {
                exercise: newExercise
            }
        });
    } catch (error) {
        if (error.code === 11000) {
            return res.status(400).json({ error: 'Exercise is already available' });
        }
        console.error('Error creating exercise:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};


exports.deleteExercise = async function (req, res) {
    try {
        const { name, type, _id, muscle, difficulty, equipment } = req.query;
        const filter = {};
        const allowedParams = ['name', 'type', '_id', 'muscle', 'equipment', 'difficulty'];

        if (Object.keys(req.query).length === 0) {
            return res.status(400).json({ error: 'Please provide exercise parameters' });
        }

        allowedParams.forEach(param => {
            if (req.query[param]) {
                filter[param] = req.query[param];
            }
        });

        // Find users based on the provided parameters
        const exercises = await Exercise.deleteOne(filter);

        // Check if any users were deleted
        if (exercises.deletedCount === 0) {
            return res.status(404).json({ error: 'No exercise found with the provided parameters' });
        }

        res.json({ message: 'Exercise deleted successfully' });
    } catch (error) {
        console.error('Error deleting Exercise:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};



const filterObj = (obj, ...allowedFields) => {
    const newObj = {};
    Object.keys(obj).forEach(el => {
        if (allowedFields.includes(el)) newObj[el] = obj[el];
    });
    return newObj;
};


exports.updateExercise = async (req, res, next) => {
    try {
        const exerciseId = req.query.id;
        // Extract the exercise ID from request parameters
        const updatedExerciseDetails = req.body; // Extract the updated exercise details from request body

        // Update the exercise by its ID
        const updatedExercise = await Exercise.findByIdAndUpdate(
            exerciseId, // Exercise ID
            updatedExerciseDetails, // Updated exercise details
            { new: true, runValidators: true } // Options to return the updated document and run validators
        );

        // Check if the exercise exists
        if (!updatedExercise) {
            return res.status(404).json({ error: 'Exercise not found' });
        }

        // Send the updated exercise as response
        res.status(200).json({
            status: 'success',
            data: {
                exercise: updatedExercise
            }
        });
    } catch (error) {
        console.error('Error updating exercise:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};



exports.getExercisesByDifficulty = async (req, res) => {
    try {
        // Find exercises sorted by difficulty
        const exercises = await Exercise.find().sort({
            difficulty: 1, // Sort by difficulty ascending
            name: 1 // Then sort by name ascending to maintain order within difficulty level
        });

        res.json(exercises);
    } catch (error) {
        console.error('Error fetching exercises:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

exports.getTop3Exercises = async (req, res) => {
    try {
        const exercises = await Exercise.find({ muscle: req.query.muscle, category: "favorite" });

        res.json(exercises);
    } catch (error) {
        console.error('Error fetching exercises with category:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};
