import User from "../models/user.js";
import userData from "../models/login_logs.js";
import PasswordReset from "../models/passwordReset.js";

import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import nodemailer from "nodemailer";
import crypto from "crypto";


export const registerUser = async (req, res) => {
  try {
    const { name, username, email, dob, password, role } = req.body;  //contains info sent from the user 

    // Check if user exists
    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(400).json({ message: "Email already exists! Try logging in!" });

    //Check if username already exists
    const existingUsername = await User.findOne({ username });
    if (existingUsername) return res.status(400).json({ message: "Username already exists! Please try a different one!" })

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    //saving the user
    const user = new User({ name, username, email, dob, password: hashedPassword, role });
    await user.save();

    res.status(201).json({ message: "User registered successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    const ipAddress = req.headers['x-forwarded-for'] || req.ip;


    const user = await User.findOne({ email });
    if (!user) {
      await userData.create({email, ipAddress, status: "Failed", reason: "User not found"})
      return res.status(400).json({ message: "User not found" });
    }
    if (user.status === "banned") {
      await userData.create({email, ipAddress, status: "Failed", reason: "User not found"})
      return res.status(400).json({ message: "User is BANNED! We are so sorry! Do YOU think we made a mistake? Contact us via email!" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      await userData.create({email, ipAddress, status: "Failed", reason: "Invalid credentials" });
      return res.status(400).json({ message: "Invalid credentials" });
    }

    
    const token = jwt.sign({ id: user._id, username: user.username, role: user.role }, process.env.JWT_SECRET, { expiresIn: "1d" });


    //save into peerCheck_logins

    await User.findByIdAndUpdate(
      user._id,
      { $set: {onlineStatus: "active"}}
    )



    await userData.create({email, ipAddress})

    //save into login_logs
    
    const loginLog = new userData({email, ipAddress, status: "Success"});
    await loginLog.save();
    

    const loggedInUser = await User.findById(user._id).select('-password')

    res.json({ message: "Login successful", token, role: user.role, user: loggedInUser });


  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

// Forgot Password
export const forgotPassword = async (req, res) => {
  const { email } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: "User not found" });

    // Generate a reset token
    const resetToken = crypto.randomBytes(20).toString("hex");
    user.resetPasswordToken = resetToken;
    user.resetPasswordExpires = Date.now() + 3600000; // 1 hour expiry
    await user.save();

    // Send email (using nodemailer)
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });


    const mailOptions = {
      to: user.email,
      from: process.env.EMAIL_USER,
      subject: "PeerCheck Password Reset",
    };

    await transporter.sendMail(mailOptions);

    res.status(200).json({ message: "Password reset email sent!" });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

// Reset Password
export const resetPassword = async (req, res) => {
  const { token } = req.params;
  const { password } = req.body;

  try {
    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: Date.now() }, // not expired
    });

    if (!user) return res.status(400).json({ message: "Invalid or expired token" });

    const hashedPassword = await bcrypt.hash(password, 10);
    user.password = hashedPassword;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();
        
    const token = generateRandomToken(); // create a token however you like
    await PasswordReset.create({
      userId: user._id,
      email: user.email,
      token: token,
    });

    res.status(200).json({ message: "Password reset successful!" });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};


export const logoutUser = async (req, res) => {
  try {
    await User.findByIdAndUpdate(req.user.id, {
      $set: { onlineStatus: "offline"}
    });

    res.json({ message: "Logged out successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

