import mongoose from "mongoose";

const peerFeedbackSchema = new mongoose.Schema({
    fromUser: {  // the one giving the feedback
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    toUser: {  // the one receiving the feedback
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    project: {  // Project context
        type: mongoose.Schema.Types.ObjectId,
        ref: "Project",
        required: true
    },
    task: {  // feedback for a specific task
        type: mongoose.Schema.Types.ObjectId,
        ref: "Task"
    },
    rating: {  //1–5 scale
        type: Number,
        required: true,
        min: 1,
        max: 5
    },
    comment: {  // detailed feedback
        type: String,
        trim: true
    },
    dateGiven: {  // When feedback was given
        type: Date,
        default: Date.now
    }
}, { timestamps: true });

const PeerFeedback = mongoose.model("PeerFeedback", peerFeedbackSchema);

export default PeerFeedback;
