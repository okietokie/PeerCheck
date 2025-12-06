import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  name: { 
    type: String, 
    required: true,
    trim: true
  },
  username: {
    type: String, 
    unique: true, // This automatically creates an index
    required: true,
    trim: true,
    lowercase: true
  },
  email: { 
    type: String, 
    required: true, 
    unique: true, // This automatically creates an index
    trim: true,
    lowercase: true
  },
  dob: {
    type: Date, 
    required: true
  },
  password: { 
    type: String, 
    required: true 
  },
  role: { 
    type: String, 
    enum: ["student", "admin", "teacher"], 
    default: "student" 
  },
  status: { 
    type: String, 
    enum: ["active", "banned"], 
    default: "active"
  },
  
  // NEW FIELDS FOR PEERTEAMS
  bio: {
    type: String,
    trim: true,
    maxlength: 500,
    default: ""
  },
  avatar: {
    type: String, // URL to profile picture
    default: null
  },
  skills: [{
    type: String,
    trim: true
  }],
  institution: {
    type: String,
    trim: true,
    default: ""
  },
  course: {
    type: String,
    trim: true,
    default: ""
  },
  year: {
    type: String,
    enum: ["1st", "2nd", "3rd", "4th", "Graduate", "Other"],
    default: "Other"
  },
  onlineStatus: {type: String},
  resetPasswordToken: String,
  resetPasswordExpires: Date,
}, {
  timestamps: true // Adds createdAt and updatedAt automatically
});

// REMOVES THE DUPLICATE INDEXES - only keeps the text search index
userSchema.index({ name: 'text', username: 'text', bio: 'text' }); // Text search index only

const User = mongoose.model("User", userSchema, "peerCheck_users");

export default User;