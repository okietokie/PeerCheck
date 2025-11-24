import DeletedProjects from "../models/deletedProjectInfo.js";
import Group from "../models/peergroup_log.js";
import Project from "../models/projects.js";
import User from "../models/user.js";

// In userController.js - update fetchUserDetails
export const fetchUserDetails = async (req, res) => {
  try {
    const user = await User.findById(req.userId).select('-password -resetPasswordToken');
    
    // Updated query to match new schema structure
    const projects = await Project.find({ "members.user": req.userId })
      .populate('createdBy.user', 'name username avatar email')
      .populate('members.user', 'name username avatar email')
      .populate('tasks');

    console.log(user.onlineStatus);

    res.status(200).json({
      username: req.username,
      user: {
        name: user.name,
        username: user.username,
        email: user.email,
        bio: user.bio,
        institution: user.institution,
        course: user.course,
        year: user.year,
        skills: user.skills,
      },
      userProjects: projects
    });
  } catch (err) {
    res.status(500).json({message: "Error fetching user details from server!"});
  }
}

export const existingPeerGroup = async ({ name, members }) => {
    try {
        const group = await Group.findOne({ members: { $all: members, $size: members.length } });

        if (group) {
            await Group.findByIdAndUpdate(
                group._id, 
                { $push: { projects: name } },
                { new: true, runValidators: true }
            );
            console.log("[userController.js]\nExisting group updated with new project:", name);
            return { message: "Project added to existing group", groupId: group._id };
        }

        // Only create new group if no existing group found
        const newGroup = new Group({ members: members, projects: [name] });
        await newGroup.save();

    } catch (err) {
        console.error("Error in existingPeerGroup:", err);
        throw err;
    }
}

// CREATE PROJECT - Updated for new schema
export const createProject = async (req, res) => {
  try {
    const { name, description, dueDate, attributes = [] } = req.body;
    const userId = req.userId; // Changed from req.user.id to req.userId to match your auth middleware

    // Validates required fields
    if (!name || !description || !dueDate) {
      return res.status(400).json({
        success: false,
        message: 'Name, description, and due date are required'
      });
    }

    // Creates project with new schema structure
    const project = new Project({
      name,
      description,
      dueDate, // Changed from endDate to dueDate
      createdBy: {
        user: userId
      },
      members: [{
        user: userId,
        userRole: 'project-lead' // Changed from role to userRole
      }],
      attributes: attributes, // Changed from requirements to attributes
      status: 'active',
      tasks: [] // Initialize empty tasks array
    });

    await project.save();

    // Returns the created project with proper population
    const populatedProject = await Project.findById(project._id)
      .populate('createdBy.user', 'name username avatar email')
      .populate('members.user', 'name username avatar email')
      .populate('tasks');

    res.status(201).json({
      success: true,
      message: 'Project created successfully',
      project: populatedProject
    });

  } catch (error) {
    console.error('Create project error:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating project',
      error: error.message
    });
  }
};

// GET USER PROJECTS - Updated for new schema
export const getUserProjects = async (req, res) => {
  try {
    const userId = req.userId; // Changed from req.user.id to req.userId

    // Finds projects where the user is a member
    const projects = await Project.find({
      'members.user': userId
    })
    .populate('createdBy.user', 'name username avatar email')
    .populate('members.user', 'name username avatar email')
    .populate('tasks')
    .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      projects: projects
    });

  } catch (error) {
    console.error('Get projects error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching projects',
      error: error.message
    });
  }
};

// UPDATE PROJECT - Updated for new schema
export const updateProject = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, dueDate, status, attributes } = req.body;
    const userId = req.userId; // Changed from req.user.id to req.userId

    // Checks if user is project lead
    const project = await Project.findOne({
      _id: id,
      'members.user': userId,
      'members.userRole': 'project-lead' // Changed from role to userRole
    });

    if (!project) {
      return res.status(403).json({
        success: false,
        message: 'Only project lead can update project'
      });
    }

    // Update fields
    const updateData = {};
    if (name) updateData.name = name;
    if (description) updateData.description = description;
    if (dueDate) updateData.dueDate = dueDate; // Changed from endDate to dueDate
    if (status) updateData.status = status;
    if (attributes) updateData.attributes = attributes; // Changed from requirements to attributes

    const updatedProject = await Project.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    )
    .populate('createdBy.user', 'name username avatar email')
    .populate('members.user', 'name username avatar email')
    .populate('tasks');

    res.status(200).json({
      success: true,
      message: 'Project updated successfully',
      project: updatedProject
    });

  } catch (error) {
    console.error('Update project error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating project',
      error: error.message
    });
  }
};

// ADD MEMBER TO PROJECT - Updated for new schema
export const addMemberToProject = async (req, res) => {
  try {
    const { id } = req.params;
    const { memberId } = req.body;
    const userId = req.userId; // Changed from req.user.id to req.userId

    // Check if user is project lead
    const project = await Project.findOne({
      _id: id,
      'members.user': userId,
      'members.userRole': 'project-lead' // Changed from role to userRole
    });

    if (!project) {
      return res.status(403).json({
        success: false,
        message: 'Only project lead can add members'
      });
    }

    // Check if member already exists
    const existingMember = project.members.find(member => 
      member.user.toString() === memberId
    );

    if (existingMember) {
      return res.status(400).json({
        success: false,
        message: 'User is already a member of this project'
      });
    }

    // Add member with new schema structure
    project.members.push({
      user: memberId,
      userRole: 'project-member' // Changed from role to userRole
    });

    await project.save();

    const updatedProject = await Project.findById(id)
      .populate('createdBy.user', 'name username avatar email')
      .populate('members.user', 'name username avatar email');

    res.status(200).json({
      success: true,
      message: 'Member added successfully',
      project: updatedProject
    });

  } catch (error) {
    console.error('Add member error:', error);
    res.status(500).json({
      success: false,
      message: 'Error adding member to project',
      error: error.message
    });
  }
};

// REMOVE MEMBER FROM PROJECT - New function for new schema
export const removeMemberFromProject = async (req, res) => {
  try {
    const { id } = req.params;
    const { memberId } = req.body;
    const userId = req.userId;

    // Check if user is project lead
    const project = await Project.findOne({
      _id: id,
      'members.user': userId,
      'members.userRole': 'project-lead'
    });

    if (!project) {
      return res.status(403).json({
        success: false,
        message: 'Only project lead can remove members'
      });
    }

    // Check if trying to remove project lead
    const memberToRemove = project.members.find(member => 
      member.user.toString() === memberId && member.userRole === 'project-lead'
    );

    if (memberToRemove) {
      return res.status(400).json({
        success: false,
        message: 'Cannot remove project lead from project'
      });
    }

    // Remove member
    project.members = project.members.filter(member => 
      member.user.toString() !== memberId
    );

    await project.save();

    const updatedProject = await Project.findById(id)
      .populate('createdBy.user', 'name username avatar email')
      .populate('members.user', 'name username avatar email');

    res.status(200).json({
      success: true,
      message: 'Member removed successfully',
      project: updatedProject
    });

  } catch (error) {
    console.error('Remove member error:', error);
    res.status(500).json({
      success: false,
      message: 'Error removing member from project',
      error: error.message
    });
  }
};

// DELETE PROJECT - Updated for new schema
export const deleteProject = async (req, res) => {
  try {
    const projectId = req.params.id;
    const userId = req.userId;

    // Check if user is project lead
    const project = await Project.findOne({
      _id: projectId,
      'members.user': userId,
      'members.userRole': 'project-lead'
    });

    if (!project) {
      return res.status(403).json({
        success: false,
        message: 'Only project lead can delete project'
      });
    }

    const deletedProject = await Project.findByIdAndDelete(projectId);

    if (!deletedProject) {
      return res.status(404).json({ 
        success: false,
        message: "Project not found" 
      });
    }

    // Save to deleted projects collection
    const deletedProjectRecord = new DeletedProjects({
      deletedProjectName: deletedProject.name,
      projectID: deletedProject._id,
      memberList: deletedProject.members
    });

    await deletedProjectRecord.save();

    res.status(200).json({ 
      success: true,
      message: "Project deleted successfully!" 
    });

  } catch (error) {
    console.error("Error deleting project:", error);
    res.status(500).json({ 
      success: false,
      message: `Error deleting project: ${error.message}` 
    });
  }
}

// GET PROJECT BY ID - New function
export const getProjectById = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.userId;

    // Check if user is a member of the project
    const project = await Project.findOne({
      _id: id,
      'members.user': userId
    })
    .populate('createdBy.user', 'name username avatar email')
    .populate('members.user', 'name username avatar email')
    .populate('tasks');

    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found or access denied'
      });
    }

    res.status(200).json({
      success: true,
      project: project
    });

  } catch (error) {
    console.error('Get project by ID error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching project',
      error: error.message
    });
  }
}