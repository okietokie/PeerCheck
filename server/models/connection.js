import mongoose from "mongoose";

const connectionSchema = new mongoose.Schema({
  fromUser: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  toUser: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  status: {
    type: String,
    enum: ["pending", "accepted", "rejected"],
    default: "pending"
  }
}, { 
  timestamps: true 
});

// Compound index to ensure unique connections between users
connectionSchema.index({ fromUser: 1, toUser: 1 }, { unique: true });

// Index for faster queries
connectionSchema.index({ fromUser: 1, status: 1 });
connectionSchema.index({ toUser: 1, status: 1 });

const Connection = mongoose.model("Connection", connectionSchema, "peerCheck_connections");

export default Connection;