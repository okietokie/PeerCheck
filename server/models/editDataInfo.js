import mongoose from 'mongoose';

const editedDataInfoSchema = new mongoose.Schema({
    taskId: {type: mongoose.Schema.Types.ObjectId, ref: "Task"},
    projectId: {type: mongoose.Schema.Types.Mixed, required: false},
    updatedData: { type: mongoose.Schema.Types.Mixed },
    editMadeAt: {type: Date, default: Date.now}
})

const EditedTaskData = mongoose.model("EditedTaskData", editedDataInfoSchema);
export default EditedTaskData;