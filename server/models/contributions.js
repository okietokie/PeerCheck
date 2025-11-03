import mongoose from "mongoose";

const contributionSchema = new mongoose.Schema({
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
        type : mongoose.Schema.Types.ObjectId,
        ref : "Task"
    },
    timeSpent : {
        type : Number,
        default : 0
    },
    progressPercent : {
        type : Number, 
        default : 0
    },
    description : {
        type : String,
        trim : true
    },
}, { timestamps : true });

const Contribution = mongoose.model("Contribution", contributionSchema, "user_contribution_log");

export default Contribution;