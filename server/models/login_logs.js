//models/login_logs.js

import mongoose from "mongoose";

const loginLogSchema = new mongoose.Schema({
    email: {type: String, required: true},
    date : {type: Date, default: Date.now}, 
    status: {type: String, default: "Success"},
    reason : {type: String, default: "Failed to catch reason"},
})

const userData =  mongoose.model("login_log", loginLogSchema, "peerCheck_logins");

export default userData;