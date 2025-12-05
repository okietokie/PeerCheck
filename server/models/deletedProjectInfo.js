import mongoose from "mongoose";

const deletedProjectsSchema = new mongoose.Schema({
    deletedProjectName : { type: String, required: true },
    projectID: {type: mongoose.Schema.Types.ObjectId, ref: "Project"},
    memberList: [String],
    deletedAt: {type: Date, default: Date.now}
})

const DeletedProjects = mongoose.model("DeletedProject",deletedProjectsSchema )

export default DeletedProjects;