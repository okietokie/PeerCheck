// teamController.js - UPDATED TO MATCH YOUR GROUP MODEL
import Group from "../models/peergroup_log.js";
import User from "../models/user.js";

// Get user's teams - UPDATED
export const getUserTeams = async (req, res) => {
  try {
    const userId = req.userId;
    const username = req.username;

    console.log(`Fetching teams for user: ${username}, ID: ${userId}`);

    // Find groups where the user is a member (using ObjectId)
    const teams = await Group.find({
      members: userId,
      deletedAt: { $exists: false }
    })
    .populate('members', 'name username email course institution') // Populate member details
    .populate('projects', 'name description') // Populate project details if needed
    .sort({ createdAt: -1 });

    console.log(`Found ${teams.length} teams`);

    // Format response to match frontend expectations
    const formattedTeams = teams.map(team => ({
      _id: team._id,
      name: team.name || `Team ${team._id.toString().slice(-6)}`,
      description: `Team with ${team.members.length} members`,
      members: team.members.map(member => ({
        _id: member._id,
        user: {
          _id: member._id,
          name: member.name,
          username: member.username,
          email: member.email,
          course: member.course,
          institution: member.institution
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

// Create new team - UPDATED
export const createTeam = async (req, res) => {
  try {
    const { name } = req.body;
    const currentUserId = req.userId;
    const currentUsername = req.username;

    console.log('Creating team with data:', { name, currentUserId, currentUsername });

    // Basic validation
    if (!name || !name.trim()) {
      return res.status(400).json({ 
        success: false,
        message: "Team name is required" 
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

    // Create the team with just the current user (using ObjectId)
    const team = new Group({
      name: name.trim(),
      members: [currentUserId], // Store user ObjectId, not username
      projects: []
      // Note: No createdBy field in your schema, so we'll skip it
    });

    await team.save();
    console.log(`Team created successfully: ${team._id}`);

    // Populate the created team to get user details
    const populatedTeam = await Group.findById(team._id)
      .populate('members', 'name username email course institution');

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
          institution: member.institution
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

// Leave team - UPDATED
export const leaveTeam = async (req, res) => {
  try {
    const { teamId } = req.params;
    const userId = req.userId;
    const username = req.username;

    console.log(`User ${username} (${userId}) leaving team ${teamId}`);

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

    // Remove user from members array (using ObjectId)
    team.members = team.members.filter(memberId => 
      memberId.toString() !== userId.toString()
    );

    // If no members left, soft delete the team
    if (team.members.length === 0) {
      team.deletedAt = new Date();
      console.log(`Team ${teamId} soft deleted as no members remain`);
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

// Add member to team (Optional - for future use)
export const addMemberToTeam = async (req, res) => {
  try {
    const { teamId } = req.params;
    const { targetUserId } = req.body;
    const currentUserId = req.userId;

    // Validate target user exists
    const userToAdd = await User.findById(targetUserId);
    if (!userToAdd) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    // Add to team
    const team = await Group.findById(teamId);
    if (!team.members.includes(targetUserId)) {
      team.members.push(targetUserId);
      await team.save();
    }

    res.status(200).json({
      success: true,
      message: "Member added successfully"
    });

  } catch (err) {
    console.error('Error adding member to team:', err);
    res.status(500).json({
      success: false,
      message: `Error adding member: ${err.message}`
    });
  }
};
// Add to teamController.js
export const updateTeam = async (req, res) => {
  try {
    const { teamId } = req.params;
    const { name } = req.body;
    const userId = req.userId;

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

    team.name = name.trim();
    await team.save();

    res.status(200).json({ 
      success: true,
      message: "Team name updated successfully",
      team 
    });

  } catch (err) {
    console.error('Error updating team:', err);
    res.status(500).json({ 
      success: false,
      message: `Error updating team: ${err.message}` 
    });
  }
};