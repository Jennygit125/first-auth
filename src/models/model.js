const mongoose = require("mongoose");
/*normal schema*/
const userSchema = new mongoose.Schema({
    firstName: {
        type: String,
        trim: true,
        required: true
    },
    lastName: {
        type: String,
        trim: true,
        required: true
    },
    email: {
        type: String,
        trim: true,
        lowercase: true,
        required: true,
        unique: true,
        index: true
    },
    password: {
        type: String,
        required: true,
        select: false
    },
    role: {
        type: String,
        enum: ["user", "moderator", "admin"],
        default: "user",
        index: true
    },
    failedLoginAttempts: {
        type: Number,
        min: 0,
        default: 0
    },
    firstFailedLoginAt: {
        type: Date,
        default: null
    },
    lockUntil: {
        type: Date,
        default: null,
        index: true
    }
}, { timestamps: true, versionKey: false });
// considered indexing login attempts and other meta data
const User = mongoose.model("User", userSchema);

module.exports = User;
