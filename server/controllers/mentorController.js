import MentorProjectAssignment from "../models/mentorProjectAssignment.js";
import User from "../models/user.js";


export const getMentors = async (req,res) => {
    try {
        const mentors = await User.find({ role: 'teacher' }).select('_id name email');
        res.status(200).json({ mentors });
    } catch (error) {
        console.error("Error fetching mentors:", error);
        res.status(500).json({ message: "Server error fetching mentors." });
    }
};

export const assignMentorToProject = async (req, res) => {
    const { mentorId, projectId } = req.body;
    try {
        // Check if assignment already exists
        const existingAssignment = await MentorProjectAssignment.findOne({ mentor: mentorId, project: projectId });
        if (existingAssignment) {
            return res.status(400).json({ message: "Mentor is already assigned to this project." });
        }
        const newAssignment = new MentorProjectAssignment({
            mentor: mentorId,
            project: projectId 
        });
        await newAssignment.save();
        res.status(201).json({ message: "Mentor assigned to project successfully.", assignment: newAssignment });
    } catch (error) {
        console.error("Error assigning mentor to project:", error);
        res.status(500).json({ message: "Server error assigning mentor to project." });
    }
};

export const removeMentorFromProject = async (req, res) => {
    const { assignmentId } = req.params;
    try {
        const deletedAssignment = await MentorProjectAssignment.findByIdAndDelete(assignmentId);
        if (!deletedAssignment) {
            return res.status(404).json({ message: "Assignment not found." });
        }
        res.status(200).json({ message: "Mentor removed from project successfully." });
    } catch (error) {
        console.error("Error removing mentor from project:", error);
        res.status(500).json({ message: "Server error removing mentor from project." });
    }   
};

