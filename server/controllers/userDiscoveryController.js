import User from "../models/user.js";
import Connection from "../models/connection.js";


// Get suggested users (users not connected with current user)
export const getSuggestedUsers = async (req, res) => {
  try {
    const userId = req.userId;
    const limit = parseInt(req.query.limit) || 50; // Increased default limit

    console.log(`Fetching suggested users for user: ${userId}, limit: ${limit}`);

    // Getting IDs of users that current user is already connected with or has pending requests with
    const existingConnections = await Connection.find({
      $or: [
        { fromUser: userId },
        { toUser: userId }
      ]
    });

    const excludedUserIds = new Set();
    excludedUserIds.add(userId.toString()); // Exclude self

    existingConnections.forEach(conn => {
      excludedUserIds.add(conn.fromUser.toString());
      excludedUserIds.add(conn.toUser.toString());
    });

    console.log(`Excluding ${excludedUserIds.size} users from suggestions`);

    // Find users not in excluded list with more flexible criteria
    const suggestedUsers = await User.find(
      { 
        _id: { $nin: Array.from(excludedUserIds) },
        status: 'active'
      },
      'name username email bio course institution joinedOn avatar'
    )
    .limit(limit)
    .sort({ joinedOn: -1 }); // Show newest users first

    console.log(`Found ${suggestedUsers.length} suggested users`);

    // If we have very few suggestions, try to include some inactive users too
    if (suggestedUsers.length < 5) {
      console.log('Very few active users found, expanding search...');
      
      const additionalUsers = await User.find(
        { 
          _id: { $nin: Array.from(excludedUserIds) },
          status: { $ne: 'banned' } // Include inactive but not banned
        },
        'name username email bio course institution joinedOn avatar'
      )
      .limit(limit - suggestedUsers.length)
      .sort({ joinedOn: -1 });

      // Merge results (avoiding duplicates)
      const additionalUserIds = new Set(suggestedUsers.map(u => u._id.toString()));
      additionalUsers.forEach(user => {
        if (!additionalUserIds.has(user._id.toString())) {
          suggestedUsers.push(user);
        }
      });

      console.log(`After expansion: ${suggestedUsers.length} total suggested users`);
    }

    res.status(200).json({ 
      success: true,
      users: suggestedUsers,
      count: suggestedUsers.length,
      message: `Found ${suggestedUsers.length} suggested users`
    });

  } catch (err) {
    console.error('Error fetching suggested users:', err);
    res.status(500).json({ 
      success: false,
      message: `Error fetching suggested users: ${err.message}` 
    });
  }
};
// Search users by name or username
export const searchUsers = async (req, res) => {
  try {
    const userId = req.userId;
    const searchQuery = req.query.q?.trim() || '';

    if (!searchQuery) return res.status(200).json({ users: [] });

    // Search users (case insensitive)
    const users = await User.find({
      $or: [
        { name: { $regex: searchQuery, $options: 'i' } },
        { username: { $regex: searchQuery, $options: 'i' } },
        { email: { $regex: searchQuery, $options: 'i' } }
      ],
      status: 'active'
    }, 'name username email bio')
    .limit(10)
    .sort({ username: 1 })
    .lean();

    res.status(200).json({ 
      users 
    });

  } catch (err) {
    console.error('Error searching users:', err);
    res.status(500).json({ message: `Error searching users: ${err.message}` });
  }
};

// Get user profile by ID
export const getUserProfile = async (req, res) => {
  try {
    const { userId } = req.params;

    const user = await User.findById(userId, 'name username email bio joinedOn status');

    if (!user) {
      return res.status(404).json({ 
        message: "User not found" 
      });
    }

    // Check connection status with current user
    const currentUserId = req.userId;
    let connectionStatus = 'none';

    if (currentUserId !== userId) {
      const connection = await Connection.findOne({
        $or: [
          { fromUser: currentUserId, toUser: userId },
          { fromUser: userId, toUser: currentUserId }
        ]
      });

      if (connection) {
        connectionStatus = connection.status;
        if (connectionStatus === 'accepted') {
          connectionStatus = 'connected';
        }
      }
    }

    res.status(200).json({ 
      user: {
        ...user.toObject(),
        connectionStatus
      }
    });

  } catch (err) {
    console.error('Error fetching user profile:', err);
    res.status(500).json({ message: `Error fetching user profile: ${err.message}` });
  }
};