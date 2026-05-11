// server/controllers/teamController.js
import mongoose from 'mongoose'; //some functions need mongoose import
import Team from "../models/peergroup_log.js";
import User from "../models/user.js";
import Connection from '../models/connection.js';
import Project from '../models/projects.js';
import Notification from '../models/notification.js';
import { createNotification } from './notificationController.js';

const formatTeamResponse = (team, currentUserId) => ({
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
    role: member._id.toString() === team.createdBy?.toString() ? 'leader' : 'member',
    isCurrentUser: member._id.toString() === currentUserId.toString()
  })),
  projects: team.projects || [],
  createdAt: team.createdAt,
  updatedAt: team.updatedAt,
  createdBy: team.createdBy,
  pendingLeadershipTransfer: team.pendingLeadershipTransfer?.toUser ? {
    toUser: team.pendingLeadershipTransfer.toUser,
    fromUser: team.pendingLeadershipTransfer.fromUser,
    requestedAt: team.pendingLeadershipTransfer.requestedAt,
    autoFinalizeOnExit: team.pendingLeadershipTransfer.autoFinalizeOnExit
  } : null,
  pendingInvites: (team.pendingInvites || []).map((invite) => ({
    user: invite.user,
    invitedBy: invite.invitedBy,
    invitedAt: invite.invitedAt
  }))
});

const clearPendingLeadershipTransfer = (team) => {
  team.pendingLeadershipTransfer = {
    toUser: null,
    fromUser: null,
    requestedAt: null,
    autoFinalizeOnExit: true
  };
};
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
    const formattedTeams = teams.map(team => formatTeamResponse(team, userId));

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
    const teamResponse = formatTeamResponse(populatedTeam, currentUserId);

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
    let autoTransferredLeaderId = null;


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

    const isCurrentLeader = team.createdBy?.toString() === userId.toString();
    const pendingTransferTargetId = team.pendingLeadershipTransfer?.toUser?.toString();

    if (isCurrentLeader && team.members.length > 1) {
      if (pendingTransferTargetId) {
        const targetStillMember = team.members.some(
          memberId => memberId.toString() === pendingTransferTargetId
        );

        if (!targetStillMember) {
          clearPendingLeadershipTransfer(team);
          return res.status(400).json({
            success: false,
            message: "The pending leadership transfer target is no longer in the team."
          });
        }

        autoTransferredLeaderId = team.pendingLeadershipTransfer.toUser;
        team.createdBy = autoTransferredLeaderId;
        clearPendingLeadershipTransfer(team);
      } else {
        return res.status(400).json({
          success: false,
          message: "Transfer leadership before leaving a team that still has other members."
        });
      }
    }

    // Remove user from members array
    team.members = team.members.filter(memberId => 
      memberId.toString() !== userId.toString()
    );

    if (team.pendingLeadershipTransfer?.toUser?.toString() === userId.toString()) {
      clearPendingLeadershipTransfer(team);
    }

    // If no members left, soft delete the team
    if (team.members.length === 0) {
      team.deletedAt = new Date();
    }

    await team.save();

    if (autoTransferredLeaderId) {
      await Notification.deleteMany({
        type: 'team_leadership_transfer',
        'data.metadata.teamId': team._id
      });

      await createNotification({
        userId: autoTransferredLeaderId,
        type: 'team_leadership_transfer_completed',
        title: 'Leadership transferred to you',
        message: `You are now the leader of "${team.name}" because the previous leader left the team.`,
        data: {
          userId,
          metadata: {
            teamId: team._id,
            teamName: team.name,
            newLeaderId: autoTransferredLeaderId,
            previousLeaderId: userId
          }
        },
        priority: 'high',
        actionUrl: '/user-app/notifications'
      });
    }

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

    const teamResponse = formatTeamResponse(updatedTeam, userId);

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

    if (!email && !username) {
      return res.status(400).json({ 
        success: false,
        message: "Either email or username is required" 
      });
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

    const isPeer = await Connection.findOne({
      $or : [
        {fromUser: currentUserId, toUser: userToInvite._id, status: "accepted"},
        {fromUser: userToInvite._id, toUser: currentUserId, status: "accepted"}
      ]
    });
    if (!isPeer){
      return res.status(404).json({
        success: false,
        message: `You are not peers yet! Request ${userToInvite.username} through your profile!`
      });
    }

    const existingPendingInvite = (team.pendingInvites || []).find(
      invite => invite.user.toString() === userToInvite._id.toString()
    );
    if (existingPendingInvite) {
      return res.status(400).json({
        success: false,
        message: "This user already has a pending invitation to the team"
      });
    }

    team.pendingInvites = [
      ...(team.pendingInvites || []),
      {
        user: userToInvite._id,
        invitedBy: currentUserId,
        invitedAt: new Date()
      }
    ];
    await team.save();

    await Notification.deleteMany({
      type: 'team_invitation',
      user: userToInvite._id,
      'data.metadata.teamId': team._id
    });

    const inviter = await User.findById(currentUserId).select('name username');
    await createNotification({
      userId: userToInvite._id,
      type: 'team_invitation',
      title: 'Team invitation',
      message: message || `${inviter?.name || inviter?.username || 'A teammate'} invited you to join "${team.name}".`,
      data: {
        userId: currentUserId,
        metadata: {
          teamId: team._id,
          teamName: team.name,
          invitedById: currentUserId,
          invitedUserId: userToInvite._id
        }
      },
      priority: 'high',
      actionUrl: '/user-app/notifications'
    });

    res.status(200).json({ 
      success: true,
      message: "Invitation sent successfully"
    });

  } catch (err) {
    console.error('Error inviting to team:', err);
    res.status(500).json({ 
      success: false,
      message: `Error sending invitation: ${err.message}` 
    });
  }
};

export const acceptTeamInvite = async (req, res) => {
  try {
    const { teamId } = req.params;
    const userId = req.userId;

    if (!mongoose.Types.ObjectId.isValid(teamId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid team ID format"
      });
    }

    const team = await Team.findOne({
      _id: teamId,
      deletedAt: { $exists: false }
    }).populate('members', 'name username email course institution bio avatar skills year onlineStatus');

    if (!team) {
      return res.status(404).json({
        success: false,
        message: "Team not found"
      });
    }

    const pendingInvite = (team.pendingInvites || []).find(
      invite => invite.user.toString() === userId.toString()
    );

    if (!pendingInvite) {
      return res.status(400).json({
        success: false,
        message: "You do not have a pending invite for this team"
      });
    }

    const alreadyMember = team.members.some(
      member => member._id.toString() === userId.toString()
    );

    if (!alreadyMember) {
      team.members.push(new mongoose.Types.ObjectId(userId));
    }

    team.pendingInvites = (team.pendingInvites || []).filter(
      invite => invite.user.toString() !== userId.toString()
    );
    await team.save();

    await Notification.deleteMany({
      type: 'team_invitation',
      user: userId,
      'data.metadata.teamId': team._id
    });

    await createNotification({
      userId: pendingInvite.invitedBy,
      type: 'team_invitation_accepted',
      title: 'Team invitation accepted',
      message: `Your invitation to join "${team.name}" was accepted.`,
      data: {
        userId,
        metadata: {
          teamId: team._id,
          teamName: team.name,
          acceptedUserId: userId
        }
      },
      priority: 'medium',
      actionUrl: '/user-app/notifications'
    });

    const updatedTeam = await Team.findById(teamId)
      .populate('members', 'name username email course institution bio avatar skills year onlineStatus');

    res.status(200).json({
      success: true,
      message: alreadyMember ? 'You are already a member of this team' : 'You joined the team successfully',
      team: formatTeamResponse(updatedTeam, userId)
    });
  } catch (err) {
    console.error('Error accepting team invite:', err);
    res.status(500).json({
      success: false,
      message: `Error accepting team invite: ${err.message}`
    });
  }
};

export const rejectTeamInvite = async (req, res) => {
  try {
    const { teamId } = req.params;
    const userId = req.userId;

    if (!mongoose.Types.ObjectId.isValid(teamId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid team ID format"
      });
    }

    const team = await Team.findOne({
      _id: teamId,
      deletedAt: { $exists: false }
    });

    if (!team) {
      return res.status(404).json({
        success: false,
        message: "Team not found"
      });
    }

    const pendingInvite = (team.pendingInvites || []).find(
      invite => invite.user.toString() === userId.toString()
    );

    if (!pendingInvite) {
      return res.status(400).json({
        success: false,
        message: "You do not have a pending invite for this team"
      });
    }

    team.pendingInvites = (team.pendingInvites || []).filter(
      invite => invite.user.toString() !== userId.toString()
    );
    await team.save();

    await Notification.deleteMany({
      type: 'team_invitation',
      user: userId,
      'data.metadata.teamId': team._id
    });

    await createNotification({
      userId: pendingInvite.invitedBy,
      type: 'team_invitation_rejected',
      title: 'Team invitation declined',
      message: `Your invitation to join "${team.name}" was declined.`,
      data: {
        userId,
        metadata: {
          teamId: team._id,
          teamName: team.name,
          declinedUserId: userId
        }
      },
      priority: 'medium',
      actionUrl: '/user-app/notifications'
    });

    res.status(200).json({
      success: true,
      message: 'Team invitation rejected'
    });
  } catch (err) {
    console.error('Error rejecting team invite:', err);
    res.status(500).json({
      success: false,
      message: `Error rejecting team invite: ${err.message}`
    });
  }
};

export const requestLeadershipTransfer = async (req, res) => {
  try {
    const { teamId } = req.params;
    const { targetUserId } = req.body;
    const currentUserId = req.userId;

    if (!mongoose.Types.ObjectId.isValid(teamId) || !mongoose.Types.ObjectId.isValid(targetUserId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid team or user ID format"
      });
    }

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

    if (team.createdBy?.toString() !== currentUserId.toString()) {
      return res.status(403).json({
        success: false,
        message: "Only the current team leader can transfer leadership"
      });
    }

    if (targetUserId.toString() === currentUserId.toString()) {
      return res.status(400).json({
        success: false,
        message: "You are already the team leader"
      });
    }

    const targetIsMember = team.members.some(memberId => memberId.toString() === targetUserId.toString());
    if (!targetIsMember) {
      return res.status(400).json({
        success: false,
        message: "Leadership can only be transferred to an existing team member"
      });
    }

    const targetUser = await User.findById(targetUserId).select('name');
    if (!targetUser) {
      return res.status(404).json({
        success: false,
        message: "Selected team member was not found"
      });
    }

    team.pendingLeadershipTransfer = {
      toUser: targetUser._id,
      fromUser: currentUserId,
      requestedAt: new Date(),
      autoFinalizeOnExit: true
    };
    await team.save();

    await Notification.deleteMany({
      type: 'team_leadership_transfer',
      'data.metadata.teamId': team._id
    });

    await createNotification({
      userId: targetUser._id,
      type: 'team_leadership_transfer',
      title: 'Leadership transfer request',
      message: `You have been asked to become the leader of "${team.name}".`,
      data: {
        userId: currentUserId,
        metadata: {
          teamId: team._id,
          teamName: team.name,
          fromUserId: currentUserId,
          toUserId: targetUser._id
        }
      },
      priority: 'high',
      actionUrl: '/user-app/notifications'
    });

    res.status(200).json({
      success: true,
      message: `Leadership transfer request sent to ${targetUser.name}`
    });
  } catch (err) {
    console.error('Error requesting leadership transfer:', err);
    res.status(500).json({
      success: false,
      message: `Error requesting leadership transfer: ${err.message}`
    });
  }
};

export const acceptLeadershipTransfer = async (req, res) => {
  try {
    const { teamId } = req.params;
    const userId = req.userId;

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
    }).populate('members', 'name username email course institution bio avatar skills year onlineStatus');

    if (!team) {
      return res.status(404).json({
        success: false,
        message: "Team not found or you are not a member"
      });
    }

    if (team.pendingLeadershipTransfer?.toUser?.toString() !== userId.toString()) {
      return res.status(400).json({
        success: false,
        message: "There is no pending leadership transfer for you on this team"
      });
    }

    const previousLeaderId = team.createdBy;
    team.createdBy = userId;
    clearPendingLeadershipTransfer(team);
    await team.save();

    await Notification.deleteMany({
      user: userId,
      type: 'team_leadership_transfer',
      'data.metadata.teamId': team._id
    });

    await createNotification({
      userId: previousLeaderId,
      type: 'team_leadership_transfer_completed',
      title: 'Leadership transfer accepted',
      message: `Leadership of "${team.name}" was accepted.`,
      data: {
        userId,
        metadata: {
          teamId: team._id,
          teamName: team.name,
          newLeaderId: userId
        }
      },
      priority: 'medium',
      actionUrl: '/user-app/notifications'
    });

    res.status(200).json({
      success: true,
      message: 'You are now the team leader',
      team: formatTeamResponse(team, userId)
    });
  } catch (err) {
    console.error('Error accepting leadership transfer:', err);
    res.status(500).json({
      success: false,
      message: `Error accepting leadership transfer: ${err.message}`
    });
  }
};

export const rejectLeadershipTransfer = async (req, res) => {
  try {
    const { teamId } = req.params;
    const userId = req.userId;

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

    if (team.pendingLeadershipTransfer?.toUser?.toString() !== userId.toString()) {
      return res.status(400).json({
        success: false,
        message: "There is no pending leadership transfer for you on this team"
      });
    }

    const previousLeaderId = team.createdBy;
    clearPendingLeadershipTransfer(team);
    await team.save();

    await Notification.deleteMany({
      user: userId,
      type: 'team_leadership_transfer',
      'data.metadata.teamId': team._id
    });

    await createNotification({
      userId: previousLeaderId,
      type: 'team_leadership_transfer_rejected',
      title: 'Leadership transfer declined',
      message: `The leadership transfer for "${team.name}" was declined.`,
      data: {
        userId,
        metadata: {
          teamId: team._id,
          teamName: team.name,
          declinedById: userId
        }
      },
      priority: 'medium',
      actionUrl: '/user-app/notifications'
    });

    res.status(200).json({
      success: true,
      message: 'Leadership transfer rejected. The current leader remains unchanged.'
    });
  } catch (err) {
    console.error('Error rejecting leadership transfer:', err);
    res.status(500).json({
      success: false,
      message: `Error rejecting leadership transfer: ${err.message}`
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
