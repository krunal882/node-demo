const jwt = require('jsonwebtoken');
const User = require('../models/userModel');
const bcrypt = require('bcrypt');
const sendEmail = require('../email')
const crypto = require('crypto');

const signToken = id => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRES_IN
    });
};

const createSendToken = (user, statusCode, res) => {
    const token = signToken(user._id);

    const cookieOptions = {
        expire: new Date(
            Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000
        ),
        httpOnly: true
    };

    res.cookie('jwt', token, cookieOptions);
    res.status(statusCode).json({
        status: 'success',
        token,
        data: {
            user
        }
    });
};

exports.signup = async (req, res) => {
    try {
        const { name, email, password, confirmPassword, age } = req.body;


        // console.log(req.body)
        // Check if the email already exists in the database
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ error: 'Email address already in use' });
        }

        // Create the new user
        const newUser = await User.create({ name, email, password, confirmPassword, age });
        console.log(newUser)

        // Generate JWT token
        const token = signToken(newUser._id);

        // Send token and user data in response
        createSendToken(newUser, 201, res)

    } catch (error) {
        if (error.code === 11000) {
            // Duplicate key error (email already exists)
            return res.status(400).json({ error: 'Email address already in use' });
        }
        console.error('Error creating user:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

exports.login = async (req, res) => {
    try {
        // Extract email and password from request body
        const { email, password } = req.body;
        console.log('body', req.body)
        // Check if email and password are provided
        if (!email || !password) {
            return res.status(400).json({ error: 'Please provide email and password' });
        }

        // Find user by email
        const user = await User.findOne({ email }).select('+password');

        if (!user) {
            return res.status(401).json({ error: 'it seems like you do not have account , please create account' });
        }
        // If user not found or password is incorrect, return error
        if (!(await bcrypt.compare(password, user.password))) {
            return res.status(401).json({ error: 'Incorrect email or password' });
        }

        // If credentials are correct, generate JWT
        const token = signToken(user._id);

        // Send JWT as response
        res.status(200).json({
            status: 'success',
            token
        });
        // res.render('success');
    } catch (error) {
        console.error('Error in login:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};



exports.protect = async (req, res, next) => {
    let token;
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
        return res.status(401).json({ error: 'You are not logged in' });
    }

    // Verify token
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // Check if user still exists
        const currentUser = await User.findById(decoded.id);
        if (!currentUser) {
            return res.status(401).json({ error: 'The user belonging to this token no longer exists' });
        }

        // Grant access to protected route
        req.user = currentUser;
        next();
    } catch (error) {
        return res.status(401).json({ error: 'Invalid token' });
    }
};

exports.restrictTo = (...roles) => {
    return (req, res, next) => {
        const role = req.user.role;
        if (!roles.includes(role)) {
            return res.status(403).json({
                error: 'You do not have permission to perform this action'
            });
        }
        next();
    };
};


exports.forgotPassword = async (req, res, next) => {
    //1. get the user from POSTed email
    const user = await User.findOne({ email: req.body.email });
    if (!user) {
        return next(new Error("There is no user with this email Address", 404));
    }
    //2. generate the resetpassword token
    const resetToken = user.createPasswordResetToken();
    await user.save({ validateBeforeSave: false });

    //3.send that token to the userMail
    const resetURL = `${req.protocol}://${req.get(
        "host"
    )}/resetPassword/${resetToken}`;

    const message = `Forgot your password? make a request with your new password and passwordConfirm to : ${resetURL}\n If you didn't forgot your password, please ignore this email! and try to login with correct credentials`;

    try {
        await sendEmail({
            email: user.email,
            subject: "Your password reset token (valid for 10 min)",
            message,
        });

        res.status(200).json({
            status: "success",
            message: "Token send to the mail",
        });
    } catch (err) {
        user.passwordResetToken = undefined;
        user.passwordResetExpires = undefined;
        await user.save({ validateBeforeSave: false });

        return next(
            new Error(
                "There was an error sending the email, Try again later!",
                500
            )
        );
    }
};

exports.resetPassword = async (req, res, next) => {
    //1.Get user based on the token
    const hashedToken = crypto
        .createHash("sha256")
        .update(req.params.token)
        .digest("hex");

    const user = await User.findOne({
        passwordResetToken: hashedToken,
        passwordResetExpires: { $gt: Date.now() },
    });

    //2. If token has not expired and there is user, set the new password
    if (!user) {
        return next(new Error("Token is invalid or has expired", 400));
    }
    console.log(req.body.newPassword, req.body.confirmPassword)
    user.password = req.body.newPassword;
    user.confirmPassword = req.body.confirmPassword;
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save();

    createSendToken(user, 200, res);
};

exports.updatePassword = async (req, res, next) => {

    const user = await User.findById(req.user.id).select("+password");
    if (!(await user.correctPassword(req.body.currentPassword, user.password))) {
        return next(new Error("your Current password is wrong ", 401));
    }
    user.password = req.body.currentPassword;
    user.confirmPassword = req.body.newPassword;
    await user.save();
    createSendToken(user, 200, res);
};