//server/mongodbConnectivity.js
import dotenv from "dotenv";  //to load and handle .env files
import mongoose from "mongoose";
import path from "path";

//dotenv.config() loads .env file
//path.resolve() provides exact file location to load it 
dotenv.config({ path: path.resolve('./server/.env') });  

const atlasURI = process.env.MONGO_URI;
const localURI = process.env.LOCAL_MONGO_URI;

const connectDB = async () => {
  try {
    await mongoose.connect(atlasURI, {
      serverSelectionTimeoutMS: 5000, // 5 seconds timeout
    });
    console.log("MongoDB Atlas Connected");
  } catch (err) {
    console.log("Atlas failed. Switching to local MongoDB...");
    try {
      await mongoose.connect(localURI); 
      console.log("Local MongoDB Connected");
    } catch (localErr) {
      console.error("Local DB connection failed:", localErr);
      process.exit(1);
    }
  }
};

export default connectDB;