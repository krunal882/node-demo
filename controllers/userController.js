const User = require('../models/userModel');

const handleErrorResponse = (res, error, msg) => {
    console.error(msg, error);
    res.status(500).json({ error: 'Internal Server Error' });
};

exports.getAllUsers = async (req, res) => {
    try {
        if (!req.query.page && !req.query.limit) {
            const users = await User.find();
            res.json(users);
        }
    } catch (error) {
        const msg = 'Error fetching users:';
        handleErrorResponse(res, error, msg);
    }
};
exports.getUser = async (req, res) => {
    try {
        const { name, email, id, role, age } = req.query;
        const filter = {};
        const allowedParams = ['name', 'email', 'role', 'age'];

        // Check if req.query is empty
        if (Object.keys(req.query).length === 0) {
            return res.status(400).json({ error: 'Please provide parameters' });
        }

        let users;

        // If id is provided, fetch user by id
        if (id) {
            users = await User.findById(id);
        } else {
            // Iterate over allowedParams and construct filter object
            for (const param of allowedParams) {
                if (req.query[param]) {
                    filter[param] = req.query[param];
                }
            }

            // Fetch users based on filter
            users = await User.find(filter);
        }

        res.json(users);
    } catch (error) {
        const msg = 'Error fetching users:';
        handleErrorResponse(res, error, msg);
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

        const users = await User.deleteMany(filter);

        if (users.deletedCount === 0) {
            return res.status(404).json({ error: 'No users found with the provided parameters' });
        }

        res.json({ message: 'Users deleted successfully' });
    } catch (error) {
        const msg = 'Error deleting users:';
        handleErrorResponse(res, error, msg);

    }
};


exports.deleteOwner = async function (req, res) {
    try {
        const { name, email, _id, role, age } = req.query;
        const filter = {};
        const allowedParams = ['name', 'email', '_id', 'role', 'age'];

        if (Object.keys(req.query).length === 0) {
            return res.status(400).json({ error: 'Please provide parameters of owner' });
        }

        allowedParams.forEach(param => {
            if (req.query[param]) {
                filter[param] = req.query[param];
            }
        });

        const owners = await User.deleteOne(filter);

        if (owners.deletedCount === 0) {
            return res.status(404).json({ error: 'No owner found with the provided parameters' });
        }

        res.json({ message: 'Owner deleted successfully' });
    } catch (error) {
        const msg = 'Error deleting owner:';
        handleErrorResponse(res, error, msg);


    }
};


exports.deleteTrainer = async function (req, res) {
    try {
        const { name, email, _id, role, age } = req.query;
        const filter = {};
        const allowedParams = ['name', 'email', '_id', 'role', 'age'];

        if (Object.keys(req.query).length === 0) {
            return res.status(400).json({ error: 'Please provide parameters of trainer' });
        }

        allowedParams.forEach(param => {
            if (req.query[param]) {
                filter[param] = req.query[param];
            }
        });

        const trainer = await User.deleteOne(filter);

        if (trainer.deletedCount === 0) {
            return res.status(404).json({ error: 'No trainer found with the provided parameters' });
        }

        res.json({ message: 'trainer deleted successfully' });
    } catch (error) {
        const msg = 'Error deleting trainer:';
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
        const deletedUser = await User.findByIdAndDelete(req.user.id);
        console.log(deletedUser);

        if (!deletedUser) {
            return res.status(404).json({ error: 'User not found' });
        }

        res.status(204).json({
            status: 'success',
            data: null
        });
    } catch (error) {
        const msg = 'Error deleting user:';
        handleErrorResponse(res, error, msg);

    }
};


exports.paginate = async (req, res, next) => {
    if (req.query.page || req.query.limit) {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        try {
            const users = await User.find()
                .skip(skip)
                .limit(limit);

            const totalCount = await User.countDocuments();

            const totalPages = Math.ceil(totalCount / limit);

            res.status(200).json({
                status: 'success',
                results: users.length,
                page,
                totalPages,
                users
            });
        } catch (error) {
            const msg = 'Error fetching user:';
            handleErrorResponse(res, error, msg);
            ;
        }
    } else {
        next();
    }
};