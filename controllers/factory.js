// // const catchAsync = require('../utils/catchAsync');
// // const AppError = require('../utils/appError');
// const Exercises = require('../models/exerciseModel');

// const exerciseControllerFactory = () => {
//     return {
//         getExerciseByMuscle: async (req, res) => {
//             const muscleName = req.params.muscle;
//             const exercises = await Exercises.find({ muscle: muscleName });
//             res.json(exercises);
//         },

//         getExerciseByType: async (req, res) => {
//             const exerciseType = req.params.type;
//             const exercises = await Exercises.find({ type: exerciseType });
//             res.json(exercises);
//         }
//     };
// };

// module.exports = exerciseControllerFactory;
