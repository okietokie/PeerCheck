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
    createdBy: {type: mongoose.Schema.Types.ObjectId, ref: "User"},
    pendingLeadershipTransfer: {
        toUser: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
        fromUser: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
        requestedAt: { type: Date, default: null },
        autoFinalizeOnExit: { type: Boolean, default: true }
    },
    pendingInvites: [{
        user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
        invitedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
        invitedAt: { type: Date, default: Date.now }
    }],
    deletedAt: { type: Date }
}, { timestamps: true });

const Team = mongoose.model("Team", peergroupSchema);

export default Team;
