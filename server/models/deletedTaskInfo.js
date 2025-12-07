import mongoose from 'mongoose';
const deletedTaskSchema = new mongoose.Schema({
    deletedTaskName : { type: String, required: true },
    taskID: {type: mongoose.Schema.Types.ObjectId, ref: "Task"},
    projectID: {type: mongoose.Schema.Types.ObjectId, ref: "Project"},
    assignedTo: {type: mongoose.Schema.Types.ObjectId, ref: "User"},
    deletedAt: {type: Date, default: Date.now}
})

const DeletedTaskInfo = mongoose.model('DeletedTaskInfo', deletedTaskSchema);

export default DeletedTaskInfo;