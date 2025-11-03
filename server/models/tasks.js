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
    assignedTo : [
        {
            user : { type: mongoose.Schema.Types.ObjectId },
            hoursSpent : { type: Number, default: 0 },
            progessPercent : { type: Number, default: 0 }
        }
    ],
    status : {
        type : String,
        enum : ["pending", "in-progress", "completed"],
        default : "pending"
    },
    startDate : {
        type : Date,
        default : Date.now
    },
    dueDate : {
        type : Date,
        required : true,
    }
}, { timestamps : true })

const Task = mongoose.model("Task", taskSchema, "peerCheck_tasks")

export default Task;