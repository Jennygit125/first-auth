const mongoose = require("mongoose");
/*what can i say this schema logs your snooping in my api*/
const activityLogSchema = new mongoose.Schema({
    action: {
        type: String,
        enum: ["FAILED_LOGIN", "FORBIDDEN_ACCESS", "ACCOUNT_DELETED", "MANUAL_ACCOUNT_LOCK"],
        required: true,
        index: true
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        default: null,
        index: true
    },
    ipAddress: {
        type: String,
        trim: true,
        default: null
    },
    metadata: {
        type: mongoose.Schema.Types.Mixed,
        default: {}
    },
    timestamp: {
        type: Date,
        default: Date.now,
        index: true
    }
}, { versionKey: false });
//indexed action and time of snooping
activityLogSchema.index({ action: 1, timestamp: -1 });
activityLogSchema.index({ user: 1, timestamp: -1 });

const ActivityLog = mongoose.model("ActivityLog", activityLogSchema);

module.exports = ActivityLog;
