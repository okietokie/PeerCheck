import User from "../models/user.js";
import userData from "../models/login_logs.js";
import PasswordReset from "../models/passwordReset.js";

import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import nodemailer from "nodemailer";
import crypto from "crypto";
import dotenv from 'dotenv';
import path from 'path';
import TourGuideInfo from "../models/tourguideInfo.js";
dotenv.config({ path: path.resolve('./server/.env') });


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

    const tourInfo = new TourGuideInfo({user: user._id})
    await tourInfo.save();

    res.status(201).json({ message: "User registered successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;


    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "User not found" });
    }
    if (user.status === "banned") {
      await userData.create({email, status: "Failed", reason: "User not found"})
      return res.status(400).json({ message: "User is BANNED! We are so sorry! Do YOU think we made a mistake? Contact us via email!" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      await userData.create({email, status: "Failed", reason: "Invalid credentials" });
      return res.status(400).json({ message: "Invalid credentials" });
    }

    
    const token = jwt.sign({ id: user._id, username: user.username, role: user.role }, process.env.JWT_SECRET, { expiresIn: "1d" });


    //save into peerCheck_logins

    await User.findByIdAndUpdate(
      user._id,
      { $set: {onlineStatus: "active"}}
    )


    await userData.create({email})

    //save into login_logs
    
    const loginLog = new userData({email, status: "Success"});
  
    await loginLog.save();
    

    const loggedInUser = await User.findById(user._id).select('-password')



    res.json({ message: "Login successful", token, role: user.role, user: loggedInUser });


  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

// Forgot Password
export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: "User not found" });

    const resetToken = crypto.randomBytes(20).toString("hex");
    user.resetPasswordToken = resetToken;
    user.resetPasswordExpires = Date.now() + 3600000; // 1 hour expiry
    await user.save();

    const resetURL = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    const mailOptions = {
      to: user.email,
      from: `"PeerCheck Team" <${process.env.EMAIL_USER}>`,
      subject: "🔐 Let's Get You Back Into Your PeerCheck Account!",
      html: `
        <!DOCTYPE html>
        <html lang="en">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>PeerCheck Password Reset</title>
          <style>
            @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Poppins:wght@300;400;500;600&display=swap');
            
            * {
              margin: 0;
              padding: 0;
              box-sizing: border-box;
            }
            
            body {
              font-family: 'Inter', sans-serif;
              line-height: 1.6;
              color: #333;
              background-color: #f8fafc;
            }
            
            .email-container {
              max-width: 600px;
              margin: 0 auto;
              padding: 20px;
            }
            
            .email-header {
              text-align: center;
              padding: 30px 0;
              background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
              border-radius: 20px 20px 0 0;
              color: white;
            }
            
            .email-logo {
              font-size: 36px;
              font-weight: 700;
              font-family: 'Poppins', sans-serif;
              margin-bottom: 10px;
              color: #800080 ;
              background: linear-gradient(135deg, #ffffff 0%, #f8fafc 100%);
              -webkit-background-clip: text;
              -webkit-text-fill-color: transparent;
              display: inline-block;
            }
            
            .email-tagline {
              font-size: 16px;
              opacity: 0.9;
              font-weight: 300;
            }
            
            .email-content {
              background: white;
              padding: 40px;
              border-radius: 0 0 20px 20px;
              box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
            }
            
            .greeting {
              font-size: 24px;
              font-weight: 600;
              margin-bottom: 15px;
              color: #1e293b;
            }
            
            .user-name {
              color: #667eea;
              font-weight: 700;
            }
            
            .message {
              font-size: 16px;
              color: #475569;
              margin-bottom: 25px;
              line-height: 1.7;
            }
            
            .highlight-box {
              background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%);
              padding: 25px;
              border-radius: 12px;
              margin: 25px 0;
              border-left: 4px solid #667eea;
            }
            
            .reset-button {
              display: inline-block;
              background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
              color: white;
              text-decoration: none;
              padding: 16px 32px;
              border-radius: 50px;
              font-weight: 600;
              font-size: 16px;
              margin: 20px 0;
              transition: all 0.3s ease;
              box-shadow: 0 4px 15px rgba(102, 126, 234, 0.3);
            }
            
            .reset-button:hover {
              transform: translateY(-2px);
              box-shadow: 0 6px 20px rgba(102, 126, 234, 0.4);
            }
            
            .reset-link {
              word-break: break-all;
              background-color: #f1f5f9;
              padding: 12px;
              border-radius: 8px;
              margin: 15px 0;
              font-family: monospace;
              font-size: 14px;
              color: #475569;
            }
            
            .security-note {
              background: #fef2f2;
              padding: 20px;
              border-radius: 10px;
              margin: 25px 0;
              border-left: 4px solid #ef4444;
            }
            
            .security-icon {
              font-size: 20px;
              margin-right: 8px;
              vertical-align: middle;
            }
            
            .footer {
              margin-top: 40px;
              padding-top: 30px;
              border-top: 2px solid #e2e8f0;
              text-align: center;
              color: #64748b;
              font-size: 14px;
            }
            
            .social-icons {
              margin: 20px 0;
            }
            
            .social-icon {
              display: inline-block;
              width: 36px;
              height: 36px;
              line-height: 36px;
              text-align: center;
              background: #f1f5f9;
              color: #64748b;
              border-radius: 50%;
              margin: 0 8px;
              text-decoration: none;
              transition: all 0.3s ease;
            }
            
            .social-icon:hover {
              background: #667eea;
              color: white;
              transform: translateY(-2px);
            }
            
            .emoji {
              font-size: 20px;
              margin-right: 8px;
              vertical-align: middle;
            }
            
            .countdown {
              display: inline-block;
              background: linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%);
              color: white;
              padding: 8px 16px;
              border-radius: 20px;
              font-weight: 600;
              font-size: 14px;
              margin: 10px 0;
            }
            
            @media (max-width: 600px) {
              .email-content {
                padding: 25px;
              }
              
              .reset-button {
                display: block;
                text-align: center;
              }
            }
          </style>
        </head>
        <body>
          <div class="email-container">
            <div class="email-header">
              <h1 class="email-logo">PeerCheck</h1>
              <p class="email-tagline">Collaborate. Create. Succeed.</p>
            </div>
            
            <div class="email-content">
              <h2 class="greeting">Hey there, <span class="user-name">${user.name || 'PeerCheck User'}</span>!</h2>
              
              <p class="message">
                <span class="emoji"></span> We heard you're having a bit of trouble accessing your account. 
                No worries—happens to the best of us! Let's get you back on track.
              </p>
              
              <div class="highlight-box">
                <p style="margin-bottom: 15px;">
                  <span class="emoji"></span> <strong>Ready to reset?</strong> Just click the magic button below:
                </p>
                
                <div style="text-align: center; color: white;">
                  <a href="${resetURL}" class="reset-button">
                    <span class="emoji"></span> Reset My Password <span class="emoji"></span>
                  </a>
                </div>
                
                <p style="text-align: center; margin: 15px 0;">
                  <span class="countdown"> Expires in 1 hour</span>
                </p>
                
                <p style="font-size: 14px; color: #64748b; text-align: center;">
                  Or copy and paste this link in your browser:
                </p>
                
                <div class="reset-link">
                  ${resetURL}
                </div>
              </div>
              
              <div class="security-note">
                <p>
                  <span class="security-icon"></span>
                  <strong>Security Heads-up:</strong> If you didn't request this password reset, 
                  please ignore this email. Your account is safe, but you might want to check 
                  your account security settings.
                </p>
              </div>
              
              <p class="message">
                <span class="emoji"></span> <strong>Pro tip:</strong> Once you're back in, consider setting up 
                two-factor authentication for extra security!
              </p>
              
              <p class="message">
                <span class="emoji"></span> Need help with anything else? Our support team is always here 
                for you at <a href="mailto:support@peercheck.com" style="color: #667eea;">support@peercheck.com</a>
              </p>
              
              <div class="footer">
                <p>Stay awesome,</p>
                <p style="font-weight: 600; color: #1e293b; margin: 10px 0;">
                  <span class="emoji"></span> The PeerCheck Team
                </p>
              
                
                <p style="margin-top: 20px;">
                  <small>
                    PeerCheck HQ • Times Education - Student Project • Abu Dhabi City, UAE
                    <br>
                    © ${new Date().getFullYear()} PeerCheck. All rights reserved.
                  </small>
                </p>
                
                <p style="font-size: 12px; color: #94a3b8; margin-top: 15px;">
                  This is an automated message. Please do not reply to this email.
                </p>
              </div>
            </div>
          </div>
        </body>
        </html>
      `,
      text: `Hey ${user.name || 'PeerCheck User'}!

We heard you're having trouble accessing your account. No worries—let's get you back on track!

PASSWORD RESET REQUEST

To reset your password, click this link:
${resetURL}

This link will expire in 1 hour.

SECURITY NOTE:
If you didn't request this password reset, please ignore this email. Your account is safe.


Need help? Email us at polluxdayzee@gmail.com

Stay awesome,
The PeerCheck Team

---
PeerCheck HQ • Times Education - Student Project • Abu Dhabi City, UAE
© ${new Date().getFullYear()} PeerCheck. All rights reserved.
      `,
    };

    await transporter.sendMail(mailOptions);

    res.status(200).json({ 
      message: "Password reset email sent! Check your inbox for our magical reset link!" 
    });
  } catch (error) {
    console.error("Forgot Password Error:", error);
    res.status(500).json({ 
      message: "Oops! Something went wrong on our end. Please try again in a few minutes." 
    });
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

    const user2 = await User.findOne({
      email: 'okietokie65@gmail.com'
    });


    if (!user) return res.status(400).json({ message: "Invalid or expired token" });

    const hashedPassword = await bcrypt.hash(password, 10);
    user.password = hashedPassword;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

        
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
    const userId  = req.userId || req.user.id;
    const user = await User.findById(userId);
    console.log("userId: ", userId);
    if (user.role !== "admin"){
          await User.findByIdAndUpdate(userId, 
      {
        $set: { onlineStatus: "offline"}
      }
    );

    }
    res.json({ success: true, message: "Logged out successfully" });
  } catch (err) {
    console.log(`error:`, err);
    res.status(500).json({ error: err.message });
  }
};

