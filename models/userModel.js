const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcrypt');
const crypto = require('crypto');

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        trim: true,
        required: [true, 'Please tell us your name!'],
        maxlength: [40, 'name must be less or equal to 40 characters'],
        minlength: [5, 'name must be greater than or equal to 5 characters']
    },
    email: {
        type: String,
        required: [true, 'Please provide your email'],
        unique: true,
        lowercase: true,
        validate: [validator.isEmail, 'Please provide a valid email']
    },
    age: {
        type: Number,
        required: [true, 'Please, specify your age.'],
        min: [12, 'you should be at least 12 years old']
    },
    role: {
        type: String,
        enum: {
            values: ['user', 'trainer', 'owner'],
            message: 'role should be either : user,trainer,owner'
        },
        default: 'user'
    },

    password: {
        type: String,
        required: [true, 'Please provide a password'],
        minlength: [7, 'password should be of length 8 or higher'],
        unique: true,
        select: false
    },
    confirmPassword: {
        type: String,
        required: [true, 'Please confirm your password'],
        validate: {
            // This only works on create and save
            validator: function (el) {
                return el === this.password;
            },
            message: 'Passwords are not the same!'
        }
    },
    passwordResetToken: String,
    passwordResetExpires: Date
});

userSchema.pre('save', async function (next) {
    if (!this.isModified('password')) return next();

    this.password = await bcrypt.hash(this.password, 12);
    ``
    this.confirmPassword = undefined;
    next();
});



userSchema.methods.createPasswordResetToken = function () {
    const resetToken = crypto.randomBytes(32).toString('hex');
    this.passwordResetToken = crypto.createHash('sha256').update(resetToken).digest('hex');
    this.passwordResetExpires = Date.now() + 10 * 60 * 1000;
    return resetToken;
};

userSchema.methods.correctPassword = async function (
    candidatePasssword,
    userPassword
) {
    return await bcrypt.compare(candidatePasssword, userPassword);
};
userSchema.methods.changedPasswordAfter = function (JWTTimestamp) {
    if (this.passwordChangedAt) {
        const changedTimestamp = parseInt(
            this.passwordChangedAt.getTime() / 1000,
            10
        );
        return JWTTimestamp < changedTimestamp;
    }
    return false;
};



const User = mongoose.model('User', userSchema);

module.exports = User;
