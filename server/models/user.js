import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  name: { 
    type: String, 
    required: true,
    trim: true
  },
  username: {
    type: String, 
    unique: true, 
    required: true,
    trim: true,
    lowercase: true
  },
  email: { 
    type: String, 
    required: true, 
    unique: true, 
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
  productivity: {
    // Core metrics
    tasksAssigned: { type: Number, default: 0 },
    tasksCompleted: { type: Number, default: 0 },
    totalFocusTime: { type: Number, default: 0 }, // seconds
    
    // Efficiency (calculated on-demand)
    overallEfficiency: { type: Number, default: 0 }, // percentage
    
    // Risk score (calculated on-demand)
    averageRiskScore: { type: Number, default: 0 },
    
    // Timeliness
    onTimeRate: { type: Number, default: 0 }, // percentage
    
    // Project contributions
    projectsContributed: [{
      projectId: { type: mongoose.Schema.Types.ObjectId, ref: "Project" },
      projectName: String,
      tasksCompleted: { type: Number, default: 0 },
      efficiency: { type: Number, default: 0 },
      lastContribution: Date
    }],
    
    lastUpdated: { type: Date, default: Date.now }
  }
}, {
  timestamps: true // Adds createdAt and updatedAt automatically
});

// REMOVES THE DUPLICATE INDEXES - only keeps the text search index
userSchema.index({ name: 'text', username: 'text', bio: 'text' }); // Text search index only

const User = mongoose.model("User", userSchema, "peerCheck_users");

export default User;