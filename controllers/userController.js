const User = require('../models/userModel');

// const router = express.Router(); 

exports.getAllUsers = async (req, res) => {
    try {
        // Check if pagination is needed
        if (!req.query.page && !req.query.limit) {
            // If pagination is not needed, simply fetch all users
            const users = await User.find();
            res.json(users);
        }
    } catch (error) {
        console.error('Error fetching users:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};
exports.getUser = async (req, res) => {
    try {
        const { name, email, id, role, age } = req.query;
        const filter = {};
        const allowedParams = ['name', 'email', 'role', 'age'];
        let users
        if (!req.query) {
            return res.status(400).json({ error: 'Please provide parameters' });
        }
        if (req.query.id) {
            users = await User.findById(req.query.id);
        }

        allowedParams.forEach(async param => {
            if (req.query[param]) {
                filter[param] = req.query[param];
                users = await User.find(filter);
            }
        });

        res.json(users);
    } catch (error) {
        console.error('Error fetching users:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

exports.deleteUser = async function (req, res) {
    try {
        const { name, email, _id, role, age } = req.query;
        const filter = {};
        const allowedParams = ['name', 'email', '_id', 'role', 'age'];

        if (Object.keys(req.query).length === 0) {
            return res.status(400).json({ error: 'Please provide parameters' });
        }

        allowedParams.forEach(param => {
            if (req.query[param]) {
                filter[param] = req.query[param];
            }
        });

        // Find users based on the provided parameters
        const users = await User.deleteMany(filter);

        // Check if any users were deleted
        if (users.deletedCount === 0) {
            return res.status(404).json({ error: 'No users found with the provided parameters' });
        }

        res.json({ message: 'Users deleted successfully' });
    } catch (error) {
        console.error('Error deleting users:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};


exports.deleteOwner = async function (req, res) {
    try {
        const { name, email, _id, role } = req.query;
        const filter = {};
        const allowedParams = ['name', 'email', '_id', 'role'];

        if (Object.keys(req.query).length === 0) {
            return res.status(400).json({ error: 'Please provide parameters of owner' });
        }

        allowedParams.forEach(param => {
            if (req.query[param]) {
                filter[param] = req.query[param];
            }
        });

        // Find users based on the provided parameters
        const owners = await User.deleteOne(filter);

        // Check if any users were deleted
        if (owners.deletedCount === 0) {
            return res.status(404).json({ error: 'No owner found with the provided parameters' });
        }

        res.json({ message: 'Owner deleted successfully' });
    } catch (error) {
        console.error('Error deleting owner:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};


exports.deleteTrainer = async function (req, res) {
    try {
        const { name, email, _id, role } = req.query;
        const filter = {};
        const allowedParams = ['name', 'email', '_id', 'role'];

        if (Object.keys(req.query).length === 0) {
            return res.status(400).json({ error: 'Please provide parameters of trainer' });
        }

        allowedParams.forEach(param => {
            if (req.query[param]) {
                filter[param] = req.query[param];
            }
        });

        // Find users based on the provided parameters
        const trainer = await User.deleteOne(filter);

        // Check if any users were deleted
        if (trainer.deletedCount === 0) {
            return res.status(404).json({ error: 'No trainer found with the provided parameters' });
        }

        res.json({ message: 'trainer deleted successfully' });
    } catch (error) {
        console.error('Error deleting trainer:', error);
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

exports.updateMe = async (req, res, next) => {
    if (req.body.password || req.body.passwordConfirm) {
        return next(
            new Error(
                'This route is not for password updates. Please use /updateMyPassword.',
                400
            )
        );
    }

    const filteredBody = filterObj(req.body, 'name', 'email', 'age');

    const updatedUser = await User.findByIdAndUpdate(req.user.id, filteredBody, {
        new: true,
        runValidators: true
    });

    res.status(200).json({
        status: 'success',
        data: {
            user: updatedUser
        }
    });
};

exports.deleteMe = async (req, res, next) => {
    try {
        // Delete the user by ID
        const deletedUser = await User.findByIdAndDelete(req.user.id);
        console.log(deletedUser);

        // Check if the user was found and deleted
        if (!deletedUser) {
            return res.status(404).json({ error: 'User not found' });
        }

        res.status(204).json({
            status: 'success',
            data: null
        });
    } catch (error) {
        console.error('Error deleting user:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};


exports.paginate = async (req, res, next) => {
    if (req.query.page || req.query.limit) {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        try {
            // Fetch users with pagination
            const users = await User.find()
                .skip(skip)
                .limit(limit);

            const totalCount = await User.countDocuments();

            // Calculate total pages
            const totalPages = Math.ceil(totalCount / limit);

            res.status(200).json({
                status: 'success',
                results: users.length,
                page,
                totalPages,
                users
            });
        } catch (error) {
            console.error('Error fetching users:', error);
            res.status(500).json({ error: 'Internal Server Error' });
        }
    } else {
        next();
    }
};