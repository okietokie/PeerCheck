// models/taskActivityEvent.js
import mongoose from "mongoose";

const taskActivityEventSchema = new mongoose.Schema(
  {
    taskId: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: "Task", 
      required: true 
    },
    
    projectId: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: "Project" 
    },

    userId: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: "User", 
      required: true 
    },
    
    userName: { type: String },
    userEmail: { type: String },
    userAvatar: { type: String },

    eventType: { 
      type: String, 
      enum: [
        // lifecycle
        "task_created",
        "start",
        "pause",
        "resume",
        "complete",
        "reopen",

        // status changes
        "status_changed",
        
        // time tracking
        "time_logged",
        
        // proof management
        "proof_uploaded",
        "proof_viewed",
        "proof_deleted",
        // task management
        "task_edited",
        "task_assigned",
        "task_reassigned",
        "deadline_updated",
        "title_update",
        "priority_updated",
        "description_updated",

        
        // grading
        "grading_updated",
        
        // comments
        "comment_added",
        
        // flags
        "flag_update",
        "efficiency_update",
        // admin/reviews
        "manual_review",
        "peer_review",
        "grade_override",
        "risk_override"
      ], 
      required: true 
    },

    // Additional data for different event types
    metadata: {
      // For status_changed
      oldStatus: String,
      newStatus: String,
      
      // For time_logged
      duration: Number, // seconds
      totalFocusTime: Number,
      
      // For proof events
      filename: String,
      proofId: mongoose.Schema.Types.ObjectId,
      
      // For task edits
      field: String,
      oldValue: mongoose.Schema.Types.Mixed,
      newValue: mongoose.Schema.Types.Mixed,
      
      // For assignment changes
      oldAssignee: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
      newAssignee: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
      
      // For deadline changes
      oldDeadline: Date,
      newDeadline: Date,
      
      // For grading
      oldScore: Number,
      newScore: Number,
      overrideType: String,
      
      // For comments
      comment: String,
      commentId: mongoose.Schema.Types.ObjectId,
      
      // For flags
      flagName: String,
      flagValue: Boolean,
      riskScore: Number,
      
      // General
      description: String,
      taskTitle: String,
      
      efficiency: String,
      label: String,
      status: String
    },

    timestamp: { 
      type: Date, 
      default: Date.now 
    }
  },
  { 
    timestamps: true,
    indexes: [
      { taskId: 1, timestamp: -1 },
      { userId: 1, timestamp: -1 },
      { projectId: 1, timestamp: -1 }
    ]
  }
);

const TaskActivityEvent = mongoose.model(
  "TaskActivityEvent",
  taskActivityEventSchema
);

export default TaskActivityEvent;