const Exercise = require('../models/exerciseModel');

const handleErrorResponse = (res, error, msg) => {
    console.error(msg, error);
    res.status(500).json({ error: 'Internal Server Error' });
};

exports.getAllExercises = async (req, res) => {
    try {
        if (!req.query.page && !req.query.limit) {
            const exercises = await Exercise.find();
            res.json(exercises);
        }
    } catch (error) {
        const msg = 'Error fetching exercises:';
        handleErrorResponse(res, error, msg);

    }
};
exports.getExercises = async (req, res) => {
    try {
        const { muscle, type, name, difficulty, equipment, id } = req.query;
        const filter = {};
        const allowedParams = ['muscle', 'type', 'name', 'difficulty', 'equipment'];
        let exercises;

        if (id) {
            exercises = await Exercise.findById(id);
        } else {
            for (const param of allowedParams) {
                if (req.query[param]) {
                    filter[param] = req.query[param];
                }
            }
            exercises = await Exercise.find(filter);
        }

        res.json(exercises);
    } catch (error) {
        const msg = 'Error fetching exercises:';
        handleErrorResponse(res, error, msg);
    }
};



exports.createExercise = async (req, res) => {
    try {
        const { name, type, muscle, equipment, difficulty } = req.body;

        const existingExercise = await Exercise.findOne({ name });
        if (existingExercise) {
            return res.status(400).json({ error: 'Exercise is already available' });
        }

        const newExercise = await Exercise.create({ name, type, muscle, equipment, difficulty });

        res.status(201).json({
            status: 'success',
            data: {
                exercise: newExercise
            }
        });

        //11000 duplicate key error
    } catch (error) {
        if (error.code === 11000) {
            return res.status(400).json({ error: 'Exercise is already available' });
        }
        const msg = 'Error creating exercises:';
        handleErrorResponse(res, error, msg);
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

        const exercises = await Exercise.deleteOne(filter);

        if (exercises.deletedCount === 0) {
            return res.status(404).json({ error: 'No exercise found with the provided parameters' });
        }

        res.json({ message: 'Exercise deleted successfully' });
    } catch (error) {
        const msg = 'Error deleting exercises:';
        handleErrorResponse(res, error, msg);
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
        const updatedExerciseDetails = req.body;
        const updatedExercise = await Exercise.findByIdAndUpdate(
            exerciseId,
            updatedExerciseDetails,
            { new: true, runValidators: true }
        );

        if (!updatedExercise) {
            return res.status(404).json({ error: 'Exercise not found' });
        }

        res.status(200).json({
            status: 'success',
            data: {
                exercise: updatedExercise
            }
        });
    } catch (error) {
        const msg = 'Error updating exercises:';
        handleErrorResponse(res, error, msg);
    }
};



exports.getExercisesByDifficulty = async (req, res) => {
    try {
        const exercises = await Exercise.find().sort({
            difficulty: 1,
            name: 1
        });

        res.json(exercises);
    } catch (error) {
        const msg = 'Error fetching exercises:';
        handleErrorResponse(res, error, msg);
    }
};

exports.getTop3Exercises = async (req, res) => {
    try {
        let exercises;

        if (req.query.muscle) {
            exercises = await Exercise.find({ muscle: req.query.muscle, category: "favorite" });
        } else {
            exercises = await Exercise.find({ category: "favorite" });
        }

        res.json(exercises);
    } catch (error) {
        const msg = 'Error fetching exercises with category';
        handleErrorResponse(res, error, msg);
    }
};
