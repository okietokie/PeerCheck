import Comment from '../models/comments.js';
import Task from '../models/tasks.js';
import mongoose from 'mongoose';

// Create a new comment
export const createComment = async (req, res) => {
    try {
        const userId = req.user.id; // The user creating the comment
        const { taskId, projectId, comment, commentedOn } = req.body;
        
        // Validate required fields
        if (!taskId || !comment) {
            return res.status(400).json({
                success: false,
                error: 'Task ID and comment text are required'
            });
        }
        
        // Validate task exists
        const taskExists = await Task.findById(taskId);
        if (!taskExists) {
            return res.status(404).json({
                success: false,
                error: 'Task not found'
            });
        }
        
        // Create new comment
        const newComment = new Comment({
            taskId,
            projectId: projectId || null,
            comment,
            commentedby: userId, // The user who is commenting
            commentedOn: commentedOn || null,
        });
        
        await newComment.save();
        
        // Populate the created comment
        const populatedComment = await Comment.findById(newComment._id)
            .populate('commentedby', 'username name email avatar')
            .populate('commentedOn', 'username name email avatar');
        
        // Update task's comments count
        await Task.findByIdAndUpdate(
            taskId,
            { $inc: { commentsCount: 1 } },
            { new: true }
        );
        
        res.status(201).json({
            success: true,
            message: 'Comment created successfully',
            comment: populatedComment
        });
        
    } catch (error) {
        console.error('Error creating comment:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
}

// Get all comments for a task
export const getCommentsByTask = async (req, res) => {
    try {
        const { taskId } = req.params;
        
        if (!mongoose.Types.ObjectId.isValid(taskId)) {
            return res.status(400).json({
                success: false,
                error: 'Invalid task ID'
            });
        }
        
        const comments = await Comment.find({ taskId })
            .populate('commentedby', 'username name email avatar')
            .populate('commentedOn', 'username name email avatar')
            .sort({ createdAt: -1 });
            
        if (!comments || comments === null || comments === undefined){
            res.status(404).json({
            success: false,
            message: "No comments on this task yet. Don't worry, be the first to comment!"
        });
        }
        res.status(200).json({
            success: true,
            comments,
            count: comments.length
        });
        
    } catch (error) {
        console.error('Error fetching comments:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
}

// Get comment by ID
export const getCommentById = async (req, res) => {
    try {
        const { commentId } = req.params;
        
        if (!mongoose.Types.ObjectId.isValid(commentId)) {
            return res.status(400).json({
                success: false,
                error: 'Invalid comment ID'
            });
        }
        
        const comment = await Comment.findById(commentId)
            .populate('commentedby', 'username name email avatar')
            .populate('commentedOn', 'username name email avatar');
            
        if (!comment) {
            return res.status(404).json({
                success: false,
                error: 'Comment not found'
            });
        }
        
        res.status(200).json({
            success: true,
            comment
        });
        
    } catch (error) {
        console.error('Error fetching comment:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
}

// Update a comment
export const updateComment = async (req, res) => {
    try {
        const userId = req.user.id;
        const { commentId } = req.params;
        const { comment: commentText } = req.body;
        
        if (!mongoose.Types.ObjectId.isValid(commentId)) {
            return res.status(400).json({
                success: false,
                error: 'Invalid comment ID'
            });
        }
        
        if (!commentText || commentText.trim() === '') {
            return res.status(400).json({
                success: false,
                error: 'Comment text is required'
            });
        }
        
        const existingComment = await Comment.findById(commentId);
        
        if (!existingComment) {
            return res.status(404).json({
                success: false,
                error: 'Comment not found'
            });
        }
        
        // Check if user is the owner of the comment - FIXED
        if (existingComment.commentedby.toString() !== userId) {
            return res.status(403).json({
                success: false,
                error: 'You are not authorized to update this comment'
            });
        }
        
        const updatedComment = await Comment.findByIdAndUpdate(
            commentId,
            { 
                comment: commentText.trim(),
                updatedAt: Date.now()
            },
            { new: true, runValidators: true }
        )
        .populate('commentedby', 'username name email avatar')
        .populate('commentedOn', 'username name email avatar');
        
        res.status(200).json({
            success: true,
            message: 'Comment updated successfully',
            comment: updatedComment
        });
        
    } catch (error) {
        console.error('Error updating comment:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
}

// Delete a comment
export const deleteComment = async (req, res) => {
    try {
        const userId = req.user.id;
        const { commentId } = req.params;
        
        if (!mongoose.Types.ObjectId.isValid(commentId)) {
            return res.status(400).json({
                success: false,
                error: 'Invalid comment ID'
            });
        }
        
        const comment = await Comment.findById(commentId);
        
        if (!comment) {
            return res.status(404).json({
                success: false,
                error: 'Comment not found'
            });
        }
        
        // Check if user is the owner of the comment - FIXED
        if (comment.commentedby.toString() !== userId) {
            // If not the owner, check if user is admin (you need to implement admin check)
            // For now, assuming no admin role
            return res.status(403).json({
                success: false,
                error: 'You are not authorized to delete this comment'
            });
        }
        
        await Comment.findByIdAndDelete(commentId);
        
        // Update task's comments count
        await Task.findByIdAndUpdate(
            comment.taskId,
            { $inc: { commentsCount: -1 } },
            { new: true }
        );
        
        res.status(200).json({
            success: true,
            message: 'Comment deleted successfully'
        });
        
    } catch (error) {
        console.error('Error deleting comment:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
}

// Get comment count for a task
export const getCommentCount = async (req, res) => {
    try {
        const { taskId } = req.params;
        
        if (!mongoose.Types.ObjectId.isValid(taskId)) {
            return res.status(400).json({
                success: false,
                error: 'Invalid task ID'
            });
        }
        
        const count = await Comment.countDocuments({ taskId });
        
        res.status(200).json({
            success: true,
            count
        });
        
    } catch (error) {
        console.error('Error getting comment count:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
}