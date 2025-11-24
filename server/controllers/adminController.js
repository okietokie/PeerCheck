// controllers/adminController.js
import LoginAttempt from "../models/login_logs.js"; // if you track login attempts
import PasswordReset from "../models/passwordReset.js"; // if you track reset requests
import usersData from "../models/user.js";

export const getSecurityStats = async (req, res) => {
  try {
    // Total login attempts
    const totalLogins = await LoginAttempt.countDocuments({});

    //total loginspast seven days
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const totalLoginsLast7Days = await LoginAttempt.countDocuments({
      date: { $gte: sevenDaysAgo } // only logs from last 7 days
    });

    // Failed login attempts
    const failedLogins = await LoginAttempt.countDocuments({ status: "Failed" });

    //failed login attempts past 24 hours
    const oneDayAgo = new Date();
    oneDayAgo.setDate(oneDayAgo.getDate() - 1);

    const failedLoginsLast24Hrs = await LoginAttempt.countDocuments({
      status: "Failed",
      date: { $gte: oneDayAgo }
    });

    
    // Password reset requests
    const passwordResets = await PasswordReset.countDocuments({});

    //password resets in 7 days
    const passwordResetsLast7Days = await PasswordReset.countDocuments({
      date: { $gte: sevenDaysAgo }
    });

    
    // // Recent suspicious activities (you can define your own criteria)
    // const recentSuspicious = await LoginAttempt.find({ suspicious: true })
    //   .sort({ createdAt: -1 })
    //   .limit(5);

    console.log(totalLoginsLast7Days);
    res.json({
      totalLogins,
      totalLoginsLast7Days,
      failedLogins,
      failedLoginsLast24Hrs,
      passwordResets,
      passwordResetsLast7Days
      //recentSuspicious
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};
// controllers/adminController.js
export const loginAttempts = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20; // Dynamic limit from frontend
    const skip = (page - 1) * limit;

    const logs = await LoginAttempt.find()
      .sort({ date: -1 })
      .skip(skip)
      .limit(limit);

    const total = await LoginAttempt.countDocuments();
    
    res.json({
      logs,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        totalRecords: total,
        hasNext: page < Math.ceil(total / limit),
        hasPrev: page > 1,
        limit: limit
      }
    });
  } catch (err) {
    res.status(500).json({ message: "Error fetching login logs" });
  }
};

export const failedLogin = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const logs = await LoginAttempt.find({ status: "Failed" })
      .sort({ date: -1 })
      .skip(skip)
      .limit(limit);

    const total = await LoginAttempt.countDocuments({ status: "Failed" });
    
    res.json({
      logs,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        totalRecords: total,
        hasNext: page < Math.ceil(total / limit),
        hasPrev: page > 1,
        limit: limit
      }
    });
  } catch (err) {
    res.status(500).json({ message: "Error fetching failed logins" });
  }
};

export const passwordResetList = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const resets = await PasswordReset.find()
      .sort({ requestedAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await PasswordReset.countDocuments();
    
    res.json({
      logs: resets,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        totalRecords: total,
        hasNext: page < Math.ceil(total / limit),
        hasPrev: page > 1,
        limit: limit
      }
    });
  } catch (err) {
    res.status(500).json({ message: "Error fetching password resets" });
  }
};

export const getAllUsers = async (req, res) => {
  try{
      const totalUsersInDB = await usersData.countDocuments({});

      const allUsers = await usersData.find({}, {name: 1, username:1,  email: 1, joinedOn:1, status:1});

      res.status(200).json({
        totalUsersInDB,
        allUsers,
  });
  }catch(err){
    res.status(500).json({message: `Error Fetching Data: ${err}`});
  }
}

export const updateStatus = async (req, res) => {
  try{
    const { id } = req.params;
    const updatedData  = req.body;
    const updatedUser = await usersData.findByIdAndUpdate(id, updatedData, {
      new: true,
    });
    res.status(200).json(updatedUser);
  }catch(err){
    res.status(500).json({message : `Error Fetching Data: ${err}`});
  }
}

