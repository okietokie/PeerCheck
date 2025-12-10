import mongoose from "mongoose";

const taskSchema = new mongoose.Schema(
  {
    taskTitle: { type: String, required: true, trim: true },
    description: { type: String, default: "This was an auto generated description", trim: true },

    assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    assignedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },

    projectId: { type: mongoose.Schema.Types.ObjectId, ref: "Project", required: true },
    deadline: { type: Date, required: true },
    estimatedTime: { type: Number, required: true }, // in seconds
    totalFocusTime: { type: Number, default: 0 },

    status: {
      type: String,
      enum: ["not_started", "active", "paused", "completed"],
      default: "not_started"
    },

    proofUploads: [
      {
        filename: String,
        fileUrl: String,
        uploadedAt: Date
      }
    ],

    // Flags for anti-fake/suspicious activity
    flags: {
      paddedTime: { type: Boolean, default: false },
      rushedCompletion: { type: Boolean, default: false },
      noProof: { type: Boolean, default: false },
      manualReviewRequired: { type: Boolean, default: false }
    },

    gradingMeta: {
      allowPeerReview: { type: Boolean, default: true },
      qualityScore: { type: Number, min: 0, max: 10, default: 0 },
      teacherOverrideScore: { type: Number, min: 0, max: 10, default: 0 }
    },

    // Calculated metrics - used in dashboard view
    metrics: {
      daysUntilDeadline: { type: Number, default: 0 },
      efficiency: { type: Number, default: 0 },
      hasProof: { type: Boolean, default: false },
      isOverdue: { type: Boolean, default: false },
      proofCount: { type: Number, default: 0 },
      riskScore: { type: Number, default: 0 },
      statusWeightPercentage: { type: Number, default: 0 }
    },

    // task-level metrics - when displaying a detailed view(per task view)
    taskMetrics: {
      daysUntilDeadline: { type: Number, default: 0 },
      efficiency: { type: Number, default: 0 },
      focusTime: { type: Number, default: 0 },
      label: { type: String, default: "" },
      percentage: { type: Number, default: 0 },
      status: { type: String, default: "" }
    },

    // Risk assessment object
    risk: {
      riskLabel: { type: String, default: "Low Risk" },
      riskLevel: { type: String, default: "low" },
      riskScore: { type: Number, default: 0 }
    },

    lastEventTime: { type: Date }
  },
  { timestamps: true }
);

const Task = mongoose.model("Task", taskSchema);
export default Task;
