import mongoose from 'mongoose';

const mentortProjectAssignmentSchema = new mongoose.Schema({
    mentor: {
        type : mongoose.Schema.Types.ObjectId,
        ref : 'User',
        required : true
    },
    project: {
        type : mongoose.Schema.Types.ObjectId,
        ref : 'Project',
        required : true
    },  
    assignedAt: {
        type: Date,
        default: Date.now
    }
});

const MentorProjectAssignment = mongoose.model('MentorProjectAssignment', mentortProjectAssignmentSchema);

export default MentorProjectAssignment;