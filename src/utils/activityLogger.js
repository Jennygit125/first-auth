const ActivityLog = require("../models/activityLog.model.js");
// activity log saying my only job is to snitch
const logActivity = async ({ action, user = null, ipAddress = null, metadata = {} }) => {
    try {
        await ActivityLog.create({
            action,
            user,
            ipAddress,
            metadata
        });
    }
    catch (e) {
        console.log("Activity log failed:", e.message);
    }
};

module.exports = logActivity;
