// teamController.js
import mongoose from 'mongoose'; //since some functions need mongoose import
import Group from "../models/peergroup_log.js";
import User from "../models/user.js";

// Get user's teams
export const getUserTeams = async (req, res) => {
  try {
    const userId = req.user.id;

    // Find groups where the user is a member
    const teams = await Group.find({
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
      updatedAt: team.updatedAt
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

    // Check if team with same name already exists for this user
    const existingTeam = await Group.findOne({
      name: name.trim(),
      members: currentUserId,
      deletedAt: { $exists: false }
    });

    if (existingTeam) {
      return res.status(400).json({ 
        success: false,
        message: "You already have a team with this name" 
      });
    }

    // Create the team
    const team = new Group({
      name: name.trim(),
      members: [currentUserId],
      projects: []
    });

    await team.save();

    
    // Populate the created team to get user details
    const populatedTeam = await Group.findById(team._id)
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
      updatedAt: populatedTeam.updatedAt
    };

    res.status(201).json({ 
      success: true,
      message: "Team created successfully", 
      team: teamResponse 
    });

  } catch (err) {
    console.error('Error creating team:', err);
    res.status(500).json({ 
      success: false,
      message: `Error creating team: ${err.message}` 
    });
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

    const team = await Group.findOne({
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

    const team = await Group.findOne({
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
    const existingTeamWithSameName = await Group.findOne({
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
    const updatedTeam = await Group.findById(teamId)
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

    //check if users are connected to each other

    if (!email && !username) {
      return res.status(400).json({ 
        success: false,
        message: "Either email or username is required" 
      });
    }




    // Check if team exists and user is a member
    const team = await Group.findOne({
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
    const updatedTeam = await Group.findById(teamId)
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

    // Get user's peer connections first
    const user = await User.findById(userId);
    
    // For now, return empty array - you can implement actual suggestions later
    // This would typically find users with similar courses, skills, etc.
    
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