// connectionController.js 
import Connection from "../models/connection.js";
import User from "../models/user.js";
import { createNotification } from "../controllers/notificationController.js";

// Send connection request
export const sendConnectionRequest = async (req, res) => {
  try {
    const { targetUserId } = req.body;
    const fromUserId = req.userId;

    if (!targetUserId) {
      return res.status(400).json({ 
        success: false,
        message: "Target user ID is required" 
      });
    }

    if (targetUserId === fromUserId) {
      return res.status(400).json({ 
        success: false,
        message: "You cannot request yourself" 
      });
    }

    // Check if target user exists
    const targetUser = await User.findById(targetUserId);
    if (!targetUser) {
      return res.status(404).json({ 
        success: false,
        message: "User not found" 
      });
    }

    // Check existing connection in both directions
    const existingConnection = await Connection.findOne({
      $or: [
        { fromUser: fromUserId, toUser: targetUserId },
        { fromUser: targetUserId, toUser: fromUserId }
      ]
    });

    if (existingConnection) {
      const status = existingConnection.status;
      if (status === 'pending') {
        return res.status(400).json({ 
          success: false,
          message: "Request already sent" 
        });
      } else if (status === 'accepted') {
        return res.status(400).json({ 
          success: false,
          message: "Already connected" 
        });
      }
    }

    const connection = await Connection.create({
      fromUser: fromUserId,
      toUser: targetUserId,
      status: "pending"
    });

    // Populate the response
    const populatedConnection = await Connection.findById(connection._id)
      .populate('fromUser', 'name username email bio course institution avatar')
      .populate('toUser', 'name username email bio course institution avatar');

    // Create notification for target user
    const fromUser = await User.findById(fromUserId).select('name username avatar');
    await createNotification({
      userId: targetUserId,
      type: 'connection_request',
      title: 'New Connection Request',
      message: `${fromUser.name || fromUser.username} wants to connect with you`,
      data: {
        fromUserId: fromUserId,
        fromUserName: fromUser.name || fromUser.username,
        fromUserAvatar: fromUser.avatar,
        connectionId: connection._id
      },
      priority: 'medium',
      actionUrl: `/user-app/profile`
    });

    res.status(201).json({ 
      success: true, 
      message: "Connection request sent successfully",
      connection: populatedConnection
    });

  } catch (err) {
    console.error('Send connection request error:', err);
    res.status(500).json({ 
      success: false,
      message: "Server error", 
      error: err.message 
    });
  }
};

// Get incoming requests
export const getIncomingRequests = async (req, res) => {
  try {
    const userId = req.userId;

    if (!userId) {
      return res.status(400).json({ 
        success: false,
        message: "User ID not found" 
      });
    }

    const requests = await Connection.find({
      toUser: userId,
      status: "pending"
    })
    .populate("fromUser", "name username email bio course institution avatar")
    .sort({ createdAt: -1 });

    res.status(200).json({ 
      success: true, 
      requests,
      count: requests.length,
      message: "Incoming requests fetched successfully"
    });

  } catch (err) {
    console.error('Get incoming requests error:', err);
    res.status(500).json({ 
      success: false,
      message: "Server error", 
      error: err.message 
    });
  }
};

// Get sent requests 
export const getSentRequests = async (req, res) => {
  try {
    const userId = req.userId;

    const requests = await Connection.find({
      fromUser: userId,
      status: "pending"
    })
    .populate("toUser", "name username email bio course institution avatar")
    .sort({ createdAt: -1 });

    res.status(200).json({ 
      success: true, 
      requests,
      count: requests.length,
      message: "Sent requests fetched successfully"
    });

  } catch (err) {
    console.error('Get sent requests error:', err);
    res.status(500).json({ 
      success: false,
      message: "Server error", 
      error: err.message 
    });
  }
};

// Get peer team
export const getPeerTeam = async (req, res) => {
  try {
    const userId = req.userId;

    const connections = await Connection.find({
      $or: [
        { fromUser: userId, status: "accepted" },
        { toUser: userId, status: "accepted" }
      ]
    })
    .populate("fromUser", "name username email bio course institution avatar")
    .populate("toUser", "name username email bio course institution avatar")
    .sort({ updatedAt: -1 });

    // Format to return only the OTHER user in the connection with connection ID
    const peers = connections.map(conn => {
      const isFromUser = conn.fromUser._id.toString() === userId;
      return {
        _id: conn._id,
        user: isFromUser ? conn.toUser : conn.fromUser,
        connectedAt: conn.updatedAt,
        connectionDate: conn.updatedAt
      };
    });

    res.status(200).json({ 
      success: true, 
      connections: peers,
      count: peers.length,
      message: "Peer team fetched successfully"
    });

  } catch (err) {
    console.error('Get peers error:', err);
    res.status(500).json({ 
      success: false,
      message: "Server error", 
      error: err.message 
    });
  }
};

// Accept request 
export const acceptRequest = async (req, res) => {
  try {
    const { connectionId } = req.params;
    const userId = req.userId;

    const connection = await Connection.findById(connectionId);

    if (!connection) {
      return res.status(404).json({ 
        success: false,
        message: "Connection request not found" 
      });
    }

    // Check if current user is the recipient of the request
    if (connection.toUser.toString() !== userId) {
      return res.status(403).json({ 
        success: false,
        message: "Not authorized to accept this request" 
      });
    }

    if (connection.status !== "pending") {
      return res.status(400).json({ 
        success: false,
        message: "Request is not pending" 
      });
    }

    connection.status = "accepted";
    await connection.save();

    // Populate the updated connection
    const populatedConnection = await Connection.findById(connectionId)
      .populate('fromUser', 'name username email bio course institution avatar')
      .populate('toUser', 'name username email bio course institution avatar');

    // Create notification for request sender
    const acceptor = await User.findById(userId).select('name username avatar');
    await createNotification({
      userId: connection.fromUser,
      type: 'connection_accepted',
      title: 'Connection Request Accepted!',
      message: `${acceptor.name || acceptor.username} accepted your connection request`,
      data: {
        acceptorId: userId,
        acceptorName: acceptor.name || acceptor.username,
        acceptorAvatar: acceptor.avatar,
        connectionId: connection._id
      },
      priority: 'medium',
      actionUrl: `/user-app/profile`
    });

    // Create notification for acceptor
    const requestor = await User.findById(connection.fromUser).select('name username avatar');
    await createNotification({
      userId: userId,
      type: 'connection_confirmed',
      title: 'You are now connected!',
      message: `You are now connected with ${requestor.name || requestor.username}`,
      data: {
        requestorId: connection.fromUser,
        requestorName: requestor.name || requestor.username,
        requestorAvatar: requestor.avatar,
        connectionId: connection._id
      },
      priority: 'low',
      actionUrl: `/user-app/profile`
    });

    res.status(200).json({ 
      success: true, 
      connection: populatedConnection,
      message: "Connection request accepted successfully"
    });

  } catch (err) {
    console.error('Accept request error:', err);
    res.status(500).json({ 
      success: false,
      message: "Server error", 
      error: err.message 
    });
  }
};

// Reject request 
export const rejectRequest = async (req, res) => {
  try {
    const { connectionId } = req.params;
    const userId = req.userId;

    const connection = await Connection.findById(connectionId);

    if (!connection) {
      return res.status(404).json({ 
        success: false,
        message: "Connection request not found" 
      });
    }

    if (connection.toUser.toString() !== userId) {
      return res.status(403).json({ 
        success: false,
        message: "Not authorized to reject this request" 
      });
    }

    connection.status = "rejected";
    await connection.save();

    // Create notification for request sender
    const decliner = await User.findById(userId).select('name username');
    await createNotification({
      userId: connection.fromUser,
      type: 'connection_declined',
      title: 'Connection Request Declined',
      message: `${decliner.name || decliner.username} declined your connection request`,
      data: {
        declinerId: userId,
        declinerName: decliner.name || decliner.username,
        connectionId: connection._id
      },
      priority: 'medium'
    });

    res.status(200).json({ 
      success: true, 
      message: "Connection request rejected successfully"
    });

  } catch (err) {
    console.error('Reject request error:', err);
    res.status(500).json({ 
      success: false,
      message: "Server error", 
      error: err.message 
    });
  }
};

// Remove connection 
export const removeConnection = async (req, res) => {
  try {
    const { connectionId } = req.params;
    const userId = req.userId;

    const connection = await Connection.findById(connectionId);

    if (!connection) {
      return res.status(404).json({ 
        success: false,
        message: "Connection not found" 
      });
    }

    // Check if user is part of this connection
    if (connection.fromUser.toString() !== userId && connection.toUser.toString() !== userId) {
      return res.status(403).json({ 
        success: false,
        message: "Not authorized to remove this connection" 
      });
    }

    // Get the other user before deleting
    const otherUserId = connection.fromUser.toString() === userId 
      ? connection.toUser 
      : connection.fromUser;
    
    const remover = await User.findById(userId).select('name username');
    const otherUser = await User.findById(otherUserId).select('name username');

    await Connection.findByIdAndDelete(connectionId);

    // Create notification for the other user
    await createNotification({
      userId: otherUserId,
      type: 'connection_removed',
      title: 'Connection Removed',
      message: `${remover.name || remover.username} removed you from their connections`,
      data: {
        removerId: userId,
        removerName: remover.name || remover.username,
        connectionId: connection._id
      },
      priority: 'medium'
    });

    res.status(200).json({ 
      success: true, 
      message: "Connection removed successfully" 
    });

  } catch (err) {
    console.error('Remove connection error:', err);
    res.status(500).json({ 
      success: false,
      message: "Server error", 
      error: err.message 
    });
  }
};

// Check connection status with another user
export const checkConnectionStatus = async (req, res) => {
  try {
    const { targetUserId } = req.params;
    const userId = req.userId;

    const connection = await Connection.findOne({
      $or: [
        { fromUser: userId, toUser: targetUserId },
        { fromUser: targetUserId, toUser: userId }
      ]
    });

    let status = 'none';
    if (connection) {
      status = connection.status;
    }

    res.status(200).json({
      success: true,
      connectionStatus: status,
      connectionId: connection?._id,
      message: "Connection status fetched successfully"
    });

  } catch (err) {
    console.error('Check connection status error:', err);
    res.status(500).json({ 
      success: false,
      message: "Server error", 
      error: err.message 
    });
  }
};

// notificationController.js - Add these notification helpers
export const notifyConnectionActions = {
  request: async (fromUserId, toUserId, connectionId) => {
    const fromUser = await User.findById(fromUserId).select('name username avatar');
    if (!fromUser) return null;

    return await createNotification({
      userId: toUserId,
      type: 'connection_request',
      title: 'New Connection Request',
      message: `${fromUser.name || fromUser.username} wants to connect with you`,
      data: {
        fromUserId,
        fromUserName: fromUser.name || fromUser.username,
        fromUserAvatar: fromUser.avatar,
        connectionId
      },
      priority: 'medium',
      actionUrl: `/user-app/profile`
    });
  },

  accepted: async (acceptorId, requestorId, connectionId) => {
    const acceptor = await User.findById(acceptorId).select('name username avatar');
    const requestor = await User.findById(requestorId).select('name username avatar');
    
    if (!acceptor || !requestor) return null;

    // Notify requestor
    await createNotification({
      userId: requestorId,
      type: 'connection_accepted',
      title: 'Connection Accepted!',
      message: `${acceptor.name || acceptor.username} accepted your connection request`,
      data: {
        acceptorId,
        acceptorName: acceptor.name || acceptor.username,
        acceptorAvatar: acceptor.avatar,
        connectionId
      },
      priority: 'medium',
      actionUrl: `/user-app/profile`
    });

    // Notify acceptor
    return await createNotification({
      userId: acceptorId,
      type: 'connection_confirmed',
      title: 'You are now connected!',
      message: `You are now connected with ${requestor.name || requestor.username}`,
      data: {
        requestorId,
        requestorName: requestor.name || requestor.username,
        requestorAvatar: requestor.avatar,
        connectionId
      },
      priority: 'low',
      actionUrl: `/user-app/profile`
    });
  },

  rejected: async (declinerId, requestorId, connectionId) => {
    const decliner = await User.findById(declinerId).select('name username');
    if (!decliner) return null;

    return await createNotification({
      userId: requestorId,
      type: 'connection_declined',
      title: 'Connection Declined',
      message: `${decliner.name || decliner.username} declined your connection request`,
      data: {
        declinerId,
        declinerName: decliner.name || decliner.username,
        connectionId
      },
      priority: 'medium'
    });
  },

  removed: async (removerId, otherUserId, connectionId) => {
    const remover = await User.findById(removerId).select('name username');
    if (!remover) return null;

    return await createNotification({
      userId: otherUserId,
      type: 'connection_removed',
      title: 'Connection Removed',
      message: `${remover.name || remover.username} removed you from their connections`,
      data: {
        removerId,
        removerName: remover.name || remover.username,
        connectionId
      },
      priority: 'medium'
    });
  }
};
