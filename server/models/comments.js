import mongoose from 'mongoose';

const commentsSchema = new mongoose.Schema({
    taskId:{
        type: mongoose.Schema.Types.ObjectId, 
        ref:"Task",
        required: true
    },
    projectId:{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Project",
    },
    comment:{
        type: String, 
    }, 
    commentedby:{
        type: mongoose.Schema.Types.ObjectId, 
        ref: "User"
    },
    commentedOn:{
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    },
    parentComment: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Comment",
            default: null
        }
}, {
    timestamps: true
});

const Comment = mongoose.model("Comment", commentsSchema);

export default Comment;