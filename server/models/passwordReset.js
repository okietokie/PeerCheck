// models/passwordReset.js
import mongoose from "mongoose";

const passwordResetSchema = new mongoose.Schema(
  {
    userId: {type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    email: { type: String, required: true },
    token: { type: String,required: true },
    used: { type: Boolean, default: false },
    requestedAt: { type: Date, default: Date.now},
  },
  { timestamps: true }
);

const PasswordReset = mongoose.model("PasswordReset", passwordResetSchema);
export default PasswordReset;
