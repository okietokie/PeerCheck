// peergroup_log.js model
import mongoose from 'mongoose';

const peergroupSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true,
    },
    members: [
        {   
            type: mongoose.Schema.Types.ObjectId, 
            ref: "User"
        }
    ],
    projects: [{
        type: mongoose.Schema.Types.ObjectId, 
        ref: "Project"
    }],
    reviewedAgain:{
        reviewedAgain: {type: Boolean, default: false},
        reviewCount: {type: Number, default: 0}
    },
    deletedAt: { type: Date }
}, { timestamps: true });

const Team = mongoose.model("Team", peergroupSchema);

export default Team;