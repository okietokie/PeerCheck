import mongoose from "mongoose";

const taskSchema = new mongoose.Schema({
    title : {
        type : String, 
        required: true, 
        trim: true
    },
    description : {
        type : String, 
        trim : true
    },
    project : {
        type : mongoose.Schema.Types.ObjectId,
        ref : "Project",
        required : true
    },
    assignedTo : 
        {
            user : { type: mongoose.Schema.Types.ObjectId, ref: "User" },
            assignedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User"},
            assignedOn: { type: Date, default: Date.now},
            selfAssigned: { type: Boolean, default: false}
        },
    createdBy : { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true},
    requiresApproval: { type: Boolean, default: false },//for self assigning tasks, approval required from project-lead
    approvedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    approvedOn: Date ,
    
    deletedInfo: {
        isDeleted: { type: Boolean, default: false },
        deletedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        deletedOn: Date,
        deletionReason: String,
    },

    status : {
        type : String,
        enum : ["pending", "in-progress", "completed"],
        default : "pending"
    },
    priority: { type: String, enum: ["low","medium","high"], default: "medium" },
    dueDate: { type: Date, required: true },
    timeSpent: { type: Number, default: 0 },
    progressPercent: { type: Number, default: 0, min: 0, max: 100 }
}, { timestamps : true })

const Task = mongoose.model("Task", taskSchema, "peerCheck_tasks")

export default Task;