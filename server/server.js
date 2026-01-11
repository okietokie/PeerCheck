//server/server.js
import express from "express";
import cors from "cors";
import dotenv from "dotenv";  //to load and handle .env files
import mongoose from "mongoose";
import path from "path";
import connectDB from "./mongodbConnectivity.js";

//dotenv.config() loads .env file
//path.resolve() provides exact file location to load it 
dotenv.config({ path: path.resolve('./server/.env') });  
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const app = express();

// Middleware
app.use(cors());  //allows your frontend (React) to access your backend. Without it, browsers block requests for security.
app.use(express.json()); //allows Express to understand JSON data sent from the frontend (like { email: "...", password: "..." }).

//establish connectivity
connectDB();


// Routes
import authRoutes from "./routes/authRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import projectRoutes from "./routes/projectRoutes.js"; 
import reviewRoutes from "./routes/reviewRoutes.js";
import peerReviewRoutes from "./routes/peerReviewRoutes.js";
import stickyNoteRoutes from "./routes/stickyNoteRoutes.js";
import { fileURLToPath } from "url";
import teacherRoutes from "./routes/teacherRoutes.js";
// import { setupDeadlineChecker } from './controllers/deadlineChecker.js';



// setupDeadlineChecker();

app.use("/api/auth", authRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/user", userRoutes);
app.use("/api/projects", projectRoutes);
app.use("/api/reviews", reviewRoutes);
app.use("/api/home", authRoutes );
app.use("/api/peer-review", peerReviewRoutes);
app.use("/api/sticky-note", stickyNoteRoutes);
app.use("/api/teacher", teacherRoutes);





// Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
