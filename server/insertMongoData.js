import mongoose from "mongoose";
import MentorProjectAssignment from "./models/mentorProjectAssignment.js";

const uri = 'mongodb+srv://okietokie65_db_user:JIzxqEjLxb6gGfN0@peercheck.hec8gjh.mongodb.net/peerCheckDB?retryWrites=true&w=majority&appName=peerCheck';

await mongoose.connect(uri);


await MentorProjectAssignment.create({
  mentor: new mongoose.Types.ObjectId("6933244b27235e17544a69f5"),
  project: new mongoose.Types.ObjectId("6939ace34841a0c5abda9da2"),
  assignedAt: new Date("2025-12-10T17:24:51.814Z"),
});

console.log("Inserted successfully");
process.exit();
