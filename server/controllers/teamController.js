// server/controllers/teamController.js
import mongoose from 'mongoose'; //some functions need mongoose import
import Team from "../models/peergroup_log.js";
import User from "../models/user.js";
import Connection from '../models/connection.js';
import Project from '../models/projects.js';
// Get user's teams
export const getUserTeams = async (req, res) => {
  try {
    const userId = req.user.id;

    // Find groups where the user is a member
    const teams = await Team.find({
      members: userId,
      deletedAt: { $exists: false }
    })
    .populate('members', 'name username email course institution bio avatar skills year onlineStatus')
    .populate('projects', 'name description status')
    .sort({ createdAt: -1 });

    // Format response to match frontend expectations
    const formattedTeams = teams.map(team => ({
      _id: team._id,
      name: team.name,
      description: team.description || `Team with ${team.members.length} members`,
      members: team.members.map(member => ({
        _id: member._id,
        user: {
          _id: member._id,
          name: member.name,
          username: member.username,
          email: member.email,
          course: member.course,
          institution: member.institution,
          bio: member.bio,
          avatar: member.avatar,
          skills: member.skills,
          year: member.year,
          onlineStatus: member.onlineStatus
        },
        role: member._id.toString() === userId.toString() ? 'leader' : 'member'
      })),
      projects: team.projects || [],
      createdAt: team.createdAt,
      updatedAt: team.updatedAt,
      createdBy: team.createdBy
    }));

    res.status(200).json({ 
      success: true,
      teams: formattedTeams,
      message: `Found ${formattedTeams.length} teams`
    });

  } catch (err) {
    console.error('Error fetching user teams:', err);
    res.status(500).json({ 
      success: false,
      message: `Error fetching teams: ${err.message}` 
    });
  }
};

// Create new team 
export const createTeam = async (req, res) => {
  try {
    const { name } = req.body;
    const currentUserId = req.userId;
    // Basic validation
    if (!name || !name.trim()) {
      return res.status(200).json({ success: false, message: "Failed to create team. Team name is required" });
    }
    if (name.trim().length < 2) {
      return res.status(200).json({ success: false, message: "Failed to create team. Team name must be at least 2 characters long" });
    }
    // Check if team with same name already exists for this user
    const existingTeam = await Team.findOne({name: name.trim(), members: currentUserId});
    if (existingTeam) {
      return res.status(200).json({ success: false, message: "Failed to create team. You already have a team with this name"  });
    }

    // Create the team
    const team = new Team({ name: name.trim(), members: [currentUserId], projects: [], createdBy: currentUserId});
    await team.save();

    // Populate the created team to get user details
    const populatedTeam = await Team.findById(team._id)
      .populate('members', 'name username email course institution bio avatar skills year onlineStatus');
    // Format response
    const teamResponse = {
      _id: populatedTeam._id,
      name: populatedTeam.name,
      description: `Team with ${populatedTeam.members.length} members`,
      members: populatedTeam.members.map(member => ({
        _id: member._id,
        user: {
          _id: member._id,
          name: member.name,
          username: member.username,
          email: member.email,
          course: member.course,
          institution: member.institution,
          bio: member.bio,
          avatar: member.avatar,
          skills: member.skills,
          year: member.year,
          onlineStatus: member.onlineStatus
        },
        role: member._id.toString() === currentUserId.toString() ? 'leader' : 'member'
      })),
      projects: populatedTeam.projects || [],
      createdAt: populatedTeam.createdAt,
      updatedAt: populatedTeam.updatedAt,
      createdBy: currentUserId
    };

    res.status(201).json({  success: true, message: "Team created successfully",  team: teamResponse });

  } catch (err) {
    console.error('Error creating team:', err);
    res.status(500).json({  success: false, message: `Error creating team: ${err.message}` });
  }
};

// Leave team 
export const leaveTeam = async (req, res) => {
  try {
    const { teamId } = req.params;
    const userId = req.userId;


    // Validate team ID format
    if (!mongoose.Types.ObjectId.isValid(teamId)) {
      return res.status(400).json({ 
        success: false,
        message: "Invalid team ID format" 
      });
    }

    const team = await Team.findOne({
      _id: teamId,
      members: userId,
      deletedAt: { $exists: false }
    });

    if (!team) {
      return res.status(404).json({ 
        success: false,
        message: "Team not found or you are not a member" 
      });
    }

    // Remove user from members array
    team.members = team.members.filter(memberId => 
      memberId.toString() !== userId.toString()
    );

    // If no members left, soft delete the team
    if (team.members.length === 0) {
      team.deletedAt = new Date();
    }

    await team.save();

    res.status(200).json({ 
      success: true,
      message: "Successfully left the team" 
    });

  } catch (err) {
    console.error('Error leaving team:', err);
    res.status(500).json({ 
      success: false,
      message: `Error leaving team: ${err.message}` 
    });
  }
};

export const deleteTeam = async (req, res) => {
  try {
    const { teamId } = req.params;
    const userId = req.userId;
console.log("team: ", teamId, "user: ", userId);
    //Validate user is creator
    const team = await Team.findOne({
      _id: teamId,
      createdBy: userId,
      deletedAt: { $exists: false }
    });
    console.log("team:", team);
    if (!team) {
      return res.status(404).json({ 
        success: false,
        message: "Team not found or you are not the creator" 
      });
    }
    // Soft delete the team
    team.deletedAt = new Date();
    await team.save();
    res.status(200).json({ 
      success: true,
      message: "Team deleted successfully" 
    });
  } catch (err) {
    console.error('Error deleting team:', err);
    res.status(500).json({ 
      success: false, 
      message: `Error deleting team: ${err.message}`
    });
  };
};
// Update team name 
export const updateTeam = async (req, res) => {
  try {
    const { teamId } = req.params;
    const { name } = req.body;
    const userId = req.userId;


    // Validate team ID format
    if (!mongoose.Types.ObjectId.isValid(teamId)) {
      return res.status(400).json({ 
        success: false,
        message: "Invalid team ID format" 
      });
    }

    if (!name || !name.trim()) {
      return res.status(400).json({ 
        success: false,
        message: "Team name is required" 
      });
    }

    if (name.trim().length < 2) {
      return res.status(400).json({ 
        success: false,
        message: "Team name must be at least 2 characters long" 
      });
    }

    const team = await Team.findOne({
      _id: teamId,
      members: userId,
      deletedAt: { $exists: false }
    });

    if (!team) {
      return res.status(404).json({ 
        success: false,
        message: "Team not found or you are not a member" 
      });
    }

    // Check if new name conflicts with existing team names for this user
    const existingTeamWithSameName = await Team.findOne({
      _id: { $ne: teamId },
      name: name.trim(),
      members: userId,
      deletedAt: { $exists: false }
    });

    if (existingTeamWithSameName) {
      return res.status(400).json({ 
        success: false,
        message: "You already have another team with this name" 
      });
    }

    team.name = name.trim();
    await team.save();

    // Populate the updated team for response
    const updatedTeam = await Team.findById(teamId)
      .populate('members', 'name username email course institution bio avatar skills year onlineStatus');

    const teamResponse = {
      _id: updatedTeam._id,
      name: updatedTeam.name,
      description: `Team with ${updatedTeam.members.length} members`,
      members: updatedTeam.members.map(member => ({
        _id: member._id,
        user: {
          _id: member._id,
          name: member.name,
          username: member.username,
          email: member.email,
          course: member.course,
          institution: member.institution,
          bio: member.bio,
          avatar: member.avatar,
          skills: member.skills,
          year: member.year,
          onlineStatus: member.onlineStatus
        },
        role: member._id.toString() === userId.toString() ? 'leader' : 'member'
      })),
      projects: updatedTeam.projects || [],
      createdAt: updatedTeam.createdAt,
      updatedAt: updatedTeam.updatedAt
    };

    res.status(200).json({ 
      success: true,
      message: "Team name updated successfully",
      team: teamResponse
    });

  } catch (err) {
    console.error('Error updating team:', err);
    res.status(500).json({ 
      success: false,
      message: `Error updating team: ${err.message}` 
    });
  }
};

// Invite member to team 
export const inviteToTeam = async (req, res) => {
  try {
    const { teamId } = req.params;
    const { email, username, message } = req.body;
    const currentUserId = req.userId;


    // Validate team ID format
    if (!mongoose.Types.ObjectId.isValid(teamId)) {
      return res.status(400).json({ 
        success: false,
        message: "Invalid team ID format" 
      });
    }

    const peer = await User.findOne({username: username});
    //check if users are connected to each other

    if (!email && !username) {
      return res.status(400).json({ 
        success: false,
        message: "Either email or username is required" 
      });
    }
    //check if members are peers
    const isPeer = await Connection.findOne({
      $or : [
        {fromUser: currentUserId, toUser: peer._id, status: "accepted"},
        {fromUser: peer._id, toUser: currentUserId, status: "accepted"}
      ]
    })
    if (!isPeer){
      return res.status(404).json({
        success: false,
        message: `You are not peers yet! Request ${username} through your profile!`
      })
    }

    // Check if team exists and user is a member
    const team = await Team.findOne({
      _id: teamId,
      members: currentUserId,
      deletedAt: { $exists: false }
    });

    if (!team) {
      return res.status(404).json({ 
        success: false,
        message: "Team not found or you are not a member" 
      });
    }

    if(team.createdBy.toString() !== currentUserId.toString()){
      return res.status(200).json({
        success: false,
        message: "Only the team creator can invite members to the team"
      })
    }
    // Find user to invite
    let userToInvite;
    if (email) {
      userToInvite = await User.findOne({ email: email.toLowerCase().trim() });
    } else if (username) {
      userToInvite = await User.findOne({ username: username.toLowerCase().trim() });
    }

    if (!userToInvite) {
      return res.status(404).json({ 
        success: false,
        message: "User not found" 
      });
    }

    // Check if user is already in the team
    if (team.members.includes(userToInvite._id)) {
      return res.status(400).json({ 
        success: false,
        message: "User is already a member of this team" 
      });
    }

    // Check if user is trying to invite themselves
    if (userToInvite._id.toString() === currentUserId.toString()) {
      return res.status(400).json({ 
        success: false,
        message: "You cannot invite yourself to the team" 
      });
    }

    // Add user to team members
    team.members.push(userToInvite._id);
    await team.save();

    // Populate the updated team for response
    const updatedTeam = await Team.findById(teamId)
      .populate('members', 'name username email course institution bio avatar skills year onlineStatus');

    const teamResponse = {
      _id: updatedTeam._id,
      name: updatedTeam.name,
      description: `Team with ${updatedTeam.members.length} members`,
      members: updatedTeam.members.map(member => ({
        _id: member._id,
        user: {
          _id: member._id,
          name: member.name,
          username: member.username,
          email: member.email,
          course: member.course,
          institution: member.institution,
          bio: member.bio,
          avatar: member.avatar,
          skills: member.skills,
          year: member.year,
          onlineStatus: member.onlineStatus
        },
        role: member._id.toString() === currentUserId.toString() ? 'leader' : 'member'
      })),
      projects: updatedTeam.projects || [],
      createdAt: updatedTeam.createdAt,
      updatedAt: updatedTeam.updatedAt
    };

    res.status(200).json({ 
      success: true,
      message: "Invitation sent successfully",
      team: teamResponse
    });

  } catch (err) {
    console.error('Error inviting to team:', err);
    res.status(500).json({ 
      success: false,
      message: `Error sending invitation: ${err.message}` 
    });
  }
};

// Get team suggestions 
export const getTeamSuggestions = async (req, res) => {
  try {
    const userId = req.userId;

    // Get user's peer connections 
    const user = await User.findById(userId);
        
    res.status(200).json({ 
      success: true,
      suggestions: [],
      message: "Team suggestions fetched successfully"
    });

  } catch (err) {
    console.error('Error fetching team suggestions:', err);
    res.status(500).json({ 
      success: false,
      message: `Error fetching suggestions: ${err.message}` 
    });
  }
};

export const getProjectTeamMembers = async (req, res) => {
  try {
    const { projectId } = req.params;
    const userId = req.userId;

    // Find the project
    const project = await Project.findById(projectId)
      .populate({
        path: 'teamId',
        select: 'name members',
        populate: {
          path: 'members',
          select: 'name username email avatar role skills year institution course productivity onlineStatus',
          model: 'User'
        }
      });

    if (!project) {
      return res.status(404).json({ 
        success: false, 
        error: 'Project not found' 
      });
    }

    // Check if user has access to this project
    const userTeams = await Team.find({
      members: userId,
      deletedAt: { $exists: false }
    });
    const userHasAccess = userTeams.some(team => 
      team._id.toString() === project.teamId._id.toString()
    );
    if (!userHasAccess) {
      return res.status(403).json({ 
        success: false, 
        error: 'You do not have access to this project team members' 
      });
    }
    // Format team members
    const teamMembers = project.teamId.members.map(member => ({
      user: {
        _id: member._id,
        name: member.name,
        username: member.username,
        email: member.email,
        avatar: member.avatar,
        role: member.role,
        skills: member.skills || [],
        year: member.year,
        institution: member.institution,
        course: member.course,
        productivity: member.productivity || {
          tasksAssigned: 0,
          tasksCompleted: 0,
          overallEfficiency: 0,
          averageRiskScore: 0,
          overallProductivityScore: 0
        },
        onlineStatus: member.onlineStatus
      },
      joinDate: member.createdAt
    }));

    res.json({
      success: true,
      members: teamMembers,
      teamName: project.teamId.name,
      projectName: project.projectName
    });

  } catch (error) {
    console.error('Error fetching project team members:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
};