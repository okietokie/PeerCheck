import mongoose from "mongoose";

const taskSchema = new mongoose.Schema(
  {
    projectId: { type: mongoose.Schema.Types.ObjectId, ref: "Project", trim: true },

    taskTitle: { type: String, required: true, trim: true},

    assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true},

    deadline: { type: Date, required: true},

    estimatedTime: {
      type: Number,     // seconds
      required: true
    },

    status: {
      type: String,
      enum: ["not_started", "active", "paused", "completed"],
      default: "not_started"
    },

    totalFocusTime: {
      type: Number,     // seconds
      default: 0
    },

    lastEventTime: { //exact time when the last task status change happened
      type: Date
    },

    //WORK PROOF
    proofUploads: [
      {
        filename: String,
        fileUrl: String,
        uploadedAt: Date
      }
    ],

    //ANTI-FAKE FLAGS
    flags: {
      paddedTime: { type: Boolean, default: false },
      rushedCompletion: { type: Boolean, default: false },
      noProof: { type: Boolean, default: false },
      manualReviewRequired: { type: Boolean, default: false }
    },

    //GRADING HOOKS
    gradingMeta: {
      allowPeerReview: { type: Boolean, default: true },
      qualityScore: {
        type: Number,
        min: 0,
        max: 10
      },
      teacherOverrideScore: {
        type: Number,
        min: 0,
        max: 10
      }
    }
  },
  { timestamps: true }
);

const Task = mongoose.model("Task", taskSchema);
export default Task;
