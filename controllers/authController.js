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

exports.signup = async (req, res, next) => {
    try {
        const { name, email, password, confirmPassword, age, role } = req.body;

        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ error: 'Email address already in use' });
        }

        const newUser = await User.create({ name, email, password, confirmPassword, age, role });


        const message = `Congratulations , ${newUser.name} Welcome to our platfor!, We're excited to have you on board.`;
        await sendEmail({
            email: newUser.email,
            subject: 'Account created Successfully!',
            message
        });

        createSendToken(newUser, 201, res);
    } catch (error) {
        if (error.code === 11000) {
            // Duplicate key error (email already exists)
            return res.status(400).json({ error: 'Email address already in use' });
        }
        console.error('Error creating user:', error);
        res.status(500).json(error);
    }
};


exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(400).json({ error: 'Please provide email and password' });
        }

        const user = await User.findOne({ email }).select('+password');

        if (!user) {
            return res.status(401).json({ error: 'it seems like you do not have account , please create account' });
        }
        if (!(await bcrypt.compare(password, user.password))) {
            return res.status(401).json({ error: 'Incorrect email or password' });
        }

        // const message = `Congratulations, ${user.name}! Welcome back! You have logged into your account successfully.`;
        // await sendEmail({
        //     email: user.email,
        //     subject: 'Logged in Successfully!',
        //     message
        // });


        // Send JWT as response
        // res.status(200).json({
        //     status: 'success',
        //     token 
        // });

        // res.render('success');
        createSendToken(user, 200, res);

    } catch (error) {
        console.error('Error in login:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

exports.logout = (req, res) => {
    res.cookie('jwt', 'loggedout', {
        expires: new Date(Date.now() + 10 * 1000),
        httpOnly: true
    });
    res.status(200).json({ status: 'success' });
}


exports.protect = async (req, res, next) => {
    let token;
    if (req.cookies.jwt) {
        token = req.cookies.jwt;
    }

    if (!token) {
        return res.status(401).json({ error: 'You are not logged in' });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        const currentUser = await User.findById(decoded.id);
        if (!currentUser) {
            return res.status(401).json({ error: 'The user belonging to this token no longer exists' });
        }

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
    const user = await User.findOne({ email: req.body.email });
    if (!user) {
        return next(new Error("There is no user with this email Address", 404));
    }
    const resetToken = user.createPasswordResetToken();
    await user.save({ validateBeforeSave: false });

    const resetURL = `${req.protocol}://${req.get("host")}/resetPassword/${resetToken}`;

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
    const hashedToken = crypto
        .createHash("sha256")
        .update(req.params.token)
        .digest("hex");

    const user = await User.findOne({
        passwordResetToken: hashedToken,
        passwordResetExpires: { $gt: Date.now() },
    });

    if (!user) {
        return next(new Error("Token is invalid or has expired", 400));
    }
    user.password = req.body.newPassword;
    user.confirmPassword = req.body.confirmPassword;
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save();

    const message = ` ${user.name}! Your password has been reset successfully`;
    await sendEmail({
        email: user.email,
        subject: 'password reset Successful!',
        message
    });


    createSendToken(user, 200, res);
};

exports.updatePassword = async (req, res, next) => {

    const user = await User.findById(req.user.id).select("+password");
    if (!(await user.correctPassword(req.body.currentPassword, user.password))) {
        return next(new Error("your Current password is wrong ", 401));
    }
    user.password = req.body.newPassword;
    user.confirmPassword = req.body.newPassword;
    await user.save();

    const message = ` ${user.name}! Your password has been updated successfully`;
    await sendEmail({
        email: user.email,
        subject: 'password update Successful!',
        message
    });

    createSendToken(user, 200, res);
};