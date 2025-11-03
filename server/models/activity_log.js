import mongoose from "mongoose";

const activityLogSchema = new mongoose.Schema({
    user : {
        type : mongoose.Schema.Types.ObjectId,
        ref : "User",
        required : true
    },
    project : {
        type : mongoose.Schema.Types.ObjectId,
        ref : "Project",
        required : true
    },
    task : {
        type : mongoose.Schema.Types.OnjectId,
        ref : "Task"
    },
    action : {
        type : String,
        required : true
    },
    details : {
        type : String, 
        trim : true
    },
    date : {
        type : Date,
        default : Date.now
    },
    duration : {
        type : Number,
        default : 0
    }

}, { timestamps: true })

const ActivityLog = mongoose.model("ActivityLog", activityLogSchema, "peerCheck_activityLogs");

export default ActivityLog;