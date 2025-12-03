import mongoose from "mongoose";

const taskActivityEventSchema = new mongoose.Schema(
  {
    taskId: { type: mongoose.Schema.Types.ObjectId, ref: "Task", required: true},

    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },

    eventType: { type: String, enum: [
                                    // lifecycle
                                    "created",
                                    "start",
                                    "pause",
                                    "resume",
                                    "complete",

                                    // updates
                                    "status_change",
                                    "time_update",
                                    "proof_upload",
                                    "flag_update",
                                    "reassigned",

                                    // admin
                                    "manual_review",
                                    "peer_review"
                                  ], required: true },

    timestamp: { type: Date, default: Date.now },

    duration: { 
        type: Number, 
        default: 0 // in seconds, computed when paused or completed 
    },

    comment: { type: String, trim: true },
  },
  { timestamps: true }
);

const TaskActivityEvent = mongoose.model(
  "TaskActivityEvent",
  taskActivityEventSchema
);

export default TaskActivityEvent;
