const mongoose = require("mongoose");
/* the moderator be snitching*/
const reportSchema = new mongoose.Schema({
    contentId: {
        type: String,
        trim: true,
        required: true,
        index: true
    },
    contentType: {
        type: String,
        enum: ["post", "comment", "user", "other"],
        default: "other"
    },
    reportType: {
        type: String,
        enum: ["spam", "abuse", "harassment", "misinformation", "other"],
        trim: true,
        required: true
    },
    description: {
        type: String,
        trim: true,
        required: true,
        maxlength: 10000
    },
    status: {
        type: String,
        enum: ["open", "reviewing", "resolved", "dismissed"],
        default: "open",
        index: true
    },
    priority: {
        type: String,
        enum: ["low", "medium", "high"],
        default: "medium",
        index: true
    },
    moderator: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
        index: true
    },
    actionTaken: {
        type: String,
        trim: true,
        default: null
    },
    resolvedAt: {
        type: Date,
        default: null
    }
}, { timestamps: true, versionKey: false });
// indexes allow for improved search efficency just for fun though
reportSchema.index({ moderator: 1, createdAt: -1 });
reportSchema.index({ status: 1, createdAt: -1 });
reportSchema.index({ contentId: 1, reportType: 1 });

const Report = mongoose.model("Report", reportSchema);

module.exports = Report;
