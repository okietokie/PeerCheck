import mongoose from 'mongoose';

const projectSchema = new mongoose.Schema(
    {
        name: { type: String, required: true, trim: true, },
        description: { type: String, required: true, trim: true, },
        createdBy: { 
                        user: {type: mongoose.Schema.Types.ObjectId, ref: "User", required: true},
                        userRole: { type: String, enum: ["project-lead", "project-member"], default: "project-lead"}
                    },
        members: [
            { 
                user : { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
                userRole: { type: String, enum: ["project-lead", "project-member"], default: "project-member"}
            }
                ],
        startDate: { type: Date, default: Date.now, },
        endDate: { type: Date, required : true },
        status: { type: String, enum: ["active", "completed", "on-hold"], default: "active", },
    },
    { 
        timestamps: true 
    }
); 

const Project = mongoose.model("Project", projectSchema, "peerCheck_projects");

export default Project;