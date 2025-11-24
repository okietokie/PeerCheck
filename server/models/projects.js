import mongoose from 'mongoose';

const projectSchema = new mongoose.Schema(
    {
        name: { type: String, required: true, trim: true, },
        description: { type: String, required: true, trim: true, },
        createdBy: { 
                        user: {type: mongoose.Schema.Types.ObjectId, ref: "User", required: true},
                    },
        members: [
            { 
                user : { type: mongoose.Schema.Types.ObjectId, ref: "User", required : true },
                userRole: { type: String, enum: ["project-lead", "project-member"], default: "project-member"},
            }
                ],
        attributes: [
            {  
                key: String,
                value: mongoose.Schema.Types.Mixed,
                type: { type: String, enum: ["text", "number", "boolean", "select"] },
                options: [String],
                required: Boolean,
                order: Number
            }
        ] ,
        tasks : [{type: mongoose.Schema.Types.ObjectId, ref: "Task"}],
        dueDate: { type: Date, required : true },
        status: { type: String, enum: ["active", "completed", "on-hold"], default: "active"},
    },
    { 
        timestamps: true 
    }
); 

const Project = mongoose.model("Project", projectSchema, "peerCheck_projects");

export default Project;