// connectionController.js - FIXED VERSION
import Connection from "../models/connection.js";
import User from "../models/user.js";

// Send connection request - FIXED
export const sendConnectionRequest = async (req, res) => {
  try {
    const { targetUserId } = req.body;
    const fromUserId = req.userId; // From authMiddleware

    if (!targetUserId) {
      return res.status(400).json({ message: "Target user ID is required" });
    }

    if (targetUserId === fromUserId) {
      return res.status(400).json({ message: "You cannot request yourself" });
    }

    // Check if target user exists
    const targetUser = await User.findById(targetUserId);
    if (!targetUser) {
      return res.status(404).json({ message: "User not found" });
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
        return res.status(400).json({ message: "Request already sent" });
      } else if (status === 'accepted') {
        return res.status(400).json({ message: "Already connected" });
      }
    }

    const connection = await Connection.create({
      fromUser: fromUserId,
      toUser: targetUserId,
      status: "pending"
    });

    // Populate the response
    const populatedConnection = await Connection.findById(connection._id)
      .populate('fromUser', 'name username email bio course institution')
      .populate('toUser', 'name username email bio course institution');

    res.status(201).json({ 
      success: true, 
      message: "Connection request sent successfully",
      connection: populatedConnection
    });

  } catch (err) {
    console.error('Send connection request error:', err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// Get incoming requests - FIXED (this should be requests received by current user)
export const getIncomingRequests = async (req, res) => {
  try {
    const userId = req.userId;
    console.log("🔍 [BACKEND] Fetching incoming requests for user ID:", userId);
    console.log("🔍 [BACKEND] User ID type:", typeof userId);

    // Check if userId is valid
    if (!userId) {
      console.log("❌ [BACKEND] No user ID found in request");
      return res.status(400).json({ message: "User ID not found" });
    }

    const requests = await Connection.find({
      toUser: userId,
      status: "pending"
    }).populate("fromUser", "name username email bio course institution");

    console.log("🔍 [BACKEND] Raw MongoDB query result:", requests);
    console.log("🔍 [BACKEND] Number of requests found:", requests.length);
    
    // Log the actual query being sent to MongoDB
    console.log("🔍 [BACKEND] Query was:", {
      toUser: userId,
      status: "pending"
    });

    res.status(200).json({ 
      success: true, 
      requests,
      message: "Incoming requests fetched successfully"
    });

  } catch (err) {
    console.error('❌ [BACKEND] Get incoming requests error:', err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// Get sent requests - FIXED (requests sent by current user)
export const getSentRequests = async (req, res) => {
  try {
    const userId = req.userId;

    const requests = await Connection.find({
      fromUser: userId,
      status: "pending"
    }).populate("toUser", "name username email bio course institution");

    res.status(200).json({ 
      success: true, 
      requests,
      message: "Sent requests fetched successfully"
    });

  } catch (err) {
    console.error('Get sent requests error:', err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// Get peer team (accepted connections) - FIXED
export const getPeerTeam = async (req, res) => {
  try {
    const userId = req.userId;

    const connections = await Connection.find({
      $or: [
        { fromUser: userId, status: "accepted" },
        { toUser: userId, status: "accepted" }
      ]
    })
    .populate("fromUser", "name username email bio course institution")
    .populate("toUser", "name username email bio course institution");

    // Format to return only the OTHER user in the connection with connection ID
    const peers = connections.map(conn => {
      const isFromUser = conn.fromUser._id.toString() === userId;
      return {
        _id: conn._id, // Connection ID for removal
        user: isFromUser ? conn.toUser : conn.fromUser,
        connectionDate: conn.updatedAt
      };
    });

    res.status(200).json({ 
      success: true, 
      connections: peers,
      message: "Peer team fetched successfully"
    });

  } catch (err) {
    console.error('Get peers error:', err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// Accept request - FIXED
export const acceptRequest = async (req, res) => {
  try {
    const { connectionId } = req.params;
    const userId = req.userId;

    const connection = await Connection.findById(connectionId);

    if (!connection) {
      return res.status(404).json({ message: "Connection request not found" });
    }

    // Check if current user is the recipient of the request
    if (connection.toUser.toString() !== userId) {
      return res.status(403).json({ message: "Not authorized to accept this request" });
    }

    if (connection.status !== "pending") {
      return res.status(400).json({ message: "Request is not pending" });
    }

    connection.status = "accepted";
    await connection.save();

    // Populate the updated connection
    const populatedConnection = await Connection.findById(connectionId)
      .populate('fromUser', 'name username email bio course institution')
      .populate('toUser', 'name username email bio course institution');

    res.status(200).json({ 
      success: true, 
      connection: populatedConnection,
      message: "Connection request accepted successfully"
    });

  } catch (err) {
    console.error('Accept request error:', err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// Reject request - FIXED
export const rejectRequest = async (req, res) => {
  try {
    const { connectionId } = req.params;
    const userId = req.userId;

    const connection = await Connection.findById(connectionId);

    if (!connection) {
      return res.status(404).json({ message: "Connection request not found" });
    }

    if (connection.toUser.toString() !== userId) {
      return res.status(403).json({ message: "Not authorized to reject this request" });
    }

    connection.status = "rejected";
    await connection.save();

    res.status(200).json({ 
      success: true, 
      message: "Connection request rejected successfully"
    });

  } catch (err) {
    console.error('Reject request error:', err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// Remove connection - FIXED
export const removeConnection = async (req, res) => {
  try {
    const { connectionId } = req.params;
    const userId = req.userId;

    const connection = await Connection.findById(connectionId);

    if (!connection) {
      return res.status(404).json({ message: "Connection not found" });
    }

    // Check if user is part of this connection
    if (connection.fromUser.toString() !== userId && connection.toUser.toString() !== userId) {
      return res.status(403).json({ message: "Not authorized to remove this connection" });
    }

    await Connection.findByIdAndDelete(connectionId);

    res.status(200).json({ 
      success: true, 
      message: "Connection removed successfully" 
    });

  } catch (err) {
    console.error('Remove connection error:', err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};