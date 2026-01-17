//server/middleware/authMiddleware.js
import jwt from "jsonwebtoken";
import User from "../models/user.js";

export const protectAdmin = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(" ")[1]; // Bearer <token>
    if (!token) return res.status(401).json({ message: "Not authorized" });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id);

    if (!user || user.role !== "admin") {
      return res.status(403).json({ message: "Admin access only" });
    }

    req.user = user;
    next();
  } catch (err) {
    res.status(401).json({ message: "Invalid token" });
  }
};

export const authMiddleware = async (req, res, next) => {
  try {
    // Get token from headers
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ message: "Unauthorized: No token provided" });
    }

    const token = authHeader.split(" ")[1]; // "Bearer <token>" -> extract token

    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (err) {
      console.error("JWT verification failed:", err.message);
      return res.status(401).json({ message: "Invalid or expired token" });
    }
      
    if (!decoded || !decoded.id) {
        return res.status(401).json({ message: "Token payload invalid" });
    }

    // Attach user ID to request object
    req.userId = decoded.id;
    req.user = decoded;   
    req.username = decoded.username;

    // Continue to the next middleware/controller
    next();
  } catch (err) {
    console.error("Auth middleware error:", err);
    res.status(401).json({ message: "Unauthorized: Invalid token" });
  }
};
export const teacherOnlyMiddleware = (req, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: "Unauthorized"
      });
    }
    if (req.user.role !== "teacher") {
      return res.status(403).json({
        success: false,
        error: "Access denied: Teachers only"
      });
    }
    next();
  } catch (error) {
    console.error("Teacher middleware error:", error);
    res.status(500).json({
      success: false,
      error: "Authorization check failed"
    });
  }
};



