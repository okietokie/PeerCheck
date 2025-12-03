import Review from "../models/review.js";
import User from "../models/user.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

// Get all reviews with filtering and pagination
export const getAllReviews = async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 10, 
      sortBy = 'createdAt', 
      sortOrder = 'desc',
      minRating,
      maxRating,
      category,
      featured,
      verified = true
    } = req.query;

    // Build query
    const query = {};
    
    if (verified !== undefined) {
      query.verified = verified === 'true';
    }
    
    if (featured !== undefined) {
      query.featured = featured === 'true';
    }
    
    if (minRating) {
      query.rating = { ...query.rating, $gte: parseInt(minRating) };
    }
    
    if (maxRating) {
      query.rating = { ...query.rating, $lte: parseInt(maxRating) };
    }
    
    if (category) {
      query.category = category;
    }

    // Calculate pagination
    const skip = (page - 1) * limit;

    // Get total count
    const totalReviews = await Review.countDocuments(query);

    // Get reviews with user details
    const reviews = await Review.find(query)
      .populate('user', 'name username email avatar')
      .sort({ [sortBy]: sortOrder === 'desc' ? -1 : 1 })
      .skip(skip)
      .limit(parseInt(limit))
      .lean();

    // Get average rating stats
    const stats = await Review.aggregate([
      {
        $match: { verified: true }
      },
      {
        $group: {
          _id: null,
          averageRating: { $avg: '$rating' },
          totalReviews: { $sum: 1 },
          ratingDistribution: {
            $push: '$rating'
          }
        }
      }
    ]);

    // Calculate rating distribution
    let ratingDistribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    if (stats.length > 0 && stats[0].ratingDistribution) {
      stats[0].ratingDistribution.forEach(rating => {
        ratingDistribution[rating] = (ratingDistribution[rating] || 0) + 1;
      });
    }

    res.json({
      success: true,
      reviews,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        totalReviews,
        totalPages: Math.ceil(totalReviews / limit),
        hasNextPage: page * limit < totalReviews,
        hasPrevPage: page > 1
      },
      statistics: {
        averageRating: stats.length > 0 ? parseFloat(stats[0].averageRating.toFixed(1)) : 0,
        totalReviews: stats.length > 0 ? stats[0].totalReviews : 0,
        ratingDistribution
      }
    });
  } catch (error) {
    console.error('Error fetching reviews:', error);
    res.status(500).json({ 
      success: false, 
      error: "Failed to fetch reviews" 
    });
  }
};

// Get recent featured reviews
export const getRecentReviews = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 3;
    
    const reviews = await Review.find({ verified: true })
      .populate('user', 'name username email avatar')
      .sort({ createdAt: -1 })
      .limit(limit)
      .lean();

    // Get average rating
    const averageRatingResult = await Review.aggregate([
      {
        $match: { verified: true }
      },
      {
        $group: {
          _id: null,
          averageRating: { $avg: '$rating' }
        }
      }
    ]);

    const averageRating = averageRatingResult.length > 0 
      ? parseFloat(averageRatingResult[0].averageRating.toFixed(1)) 
      : 0;

    res.json({
      success: true,
      reviews,
      averageRating
    });
  } catch (error) {
    console.error('Error fetching recent reviews:', error);
    res.status(500).json({ 
      success: false, 
      error: "Failed to fetch recent reviews" 
    });
  }
};

// Get helpful reviews (most voted)
export const getHelpfulReviews = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 3;
    
    const reviews = await Review.find({ verified: true })
      .populate('user', 'name username email avatar')
      .sort({ helpfulVotes: -1, createdAt: -1 })
      .limit(limit)
      .lean();

    res.json({
      success: true,
      reviews
    });
  } catch (error) {
    console.error('Error fetching helpful reviews:', error);
    res.status(500).json({ 
      success: false, 
      error: "Failed to fetch helpful reviews" 
    });
  }
};

// Create a new review
export const createReview = async (req, res) => {
  try {
    const { rating, title, content, category, tags } = req.body;
    const userId = req.user?.id;

    // Validation
    if (!rating || !title || !content) {
      return res.status(400).json({
        success: false,
        error: "Rating, title, and content are required"
      });
    }

    if (rating < 1 || rating > 5) {
      return res.status(400).json({
        success: false,
        error: "Rating must be between 1 and 5"
      });
    }

    // Check if user exists
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        error: "User not found"
      });
    }

    // Check if user has already submitted a review recently (optional limit)
    const recentReview = await Review.findOne({
      user: userId,
      createdAt: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) } // Within 24 hours
    });

    if (recentReview && !req.user.role === 'admin') {
      return res.status(429).json({
        success: false,
        error: "You can only submit one review per day"
      });
    }

    // Create review
    const review = new Review({
      user: userId,
      rating: parseInt(rating),
      title: title.trim(),
      content: content.trim(),
      category: category || 'general',
      tags: tags || [],
      verified: req.user.role === 'admin', // Auto-verify admin reviews
      ipAddress: req.ip,
      userAgent: req.headers['user-agent']
    });

    await review.save();

    // Populate user details
    const populatedReview = await Review.findById(review._id)
      .populate('user', 'name username email avatar');

    // Update user's review count (optional field in User model)
    user.totalReviews = (user.totalReviews || 0) + 1;
    await user.save();

    res.status(201).json({
      success: true,
      message: "Review submitted successfully!",
      review: populatedReview
    });
  } catch (error) {
    console.error('Error creating review:', error);
    res.status(500).json({ 
      success: false, 
      error: "Failed to submit review" 
    });
  }
};

// Submit review as guest (with verification)
export const submitGuestReview = async (req, res) => {
  try {
    const { rating, title, content, email, password, category, tags } = req.body;

    // Validation
    if (!rating || !title || !content || !email || !password) {
      return res.status(400).json({
        success: false,
        error: "All fields are required for guest review"
      });
    }

    // Verify user credentials
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({
        success: false,
        error: "Invalid email or password"
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        error: "Invalid email or password"
      });
    }

    // Check for recent review
    const recentReview = await Review.findOne({
      user: user._id,
      createdAt: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) }
    });

    if (recentReview) {
      return res.status(429).json({
        success: false,
        error: "You can only submit one review per day"
      });
    }

    // Create review
    const review = new Review({
      user: user._id,
      rating: parseInt(rating),
      title: title.trim(),
      content: content.trim(),
      category: category || 'general',
      tags: tags || [],
      verified: false, // Guest reviews need verification
      ipAddress: req.ip,
      userAgent: req.headers['user-agent']
    });

    await review.save();

    res.status(201).json({
      success: true,
      message: "Review submitted for verification. Thank you!",
      review: {
        _id: review._id,
        rating: review.rating,
        title: review.title,
        content: review.content,
        category: review.category,
        createdAt: review.createdAt
      }
    });
  } catch (error) {
    console.error('Error submitting guest review:', error);
    res.status(500).json({ 
      success: false, 
      error: "Failed to submit review" 
    });
  }
};

// Vote on a review (helpful/not helpful)
export const voteReview = async (req, res) => {
  try {
    const { reviewId } = req.params;
    const { voteType } = req.body; // 'helpful' or 'not-helpful'
    const userId = req.user?.id;

    const review = await Review.findById(reviewId);
    if (!review) {
      return res.status(404).json({
        success: false,
        error: "Review not found"
      });
    }

    if (voteType === 'helpful') {
      review.helpfulVotes += 1;
    } else if (voteType === 'not-helpful') {
      review.helpfulVotes = Math.max(0, review.helpfulVotes - 1);
    }

    await review.save();

    res.json({
      success: true,
      message: "Vote recorded successfully",
      helpfulVotes: review.helpfulVotes
    });
  } catch (error) {
    console.error('Error voting on review:', error);
    res.status(500).json({ 
      success: false, 
      error: "Failed to record vote" 
    });
  }
};

// Get review statistics
export const getReviewStats = async (req, res) => {
  try {
    const stats = await Review.aggregate([
      {
        $match: { verified: true }
      },
      {
        $group: {
          _id: null,
          averageRating: { $avg: '$rating' },
          totalReviews: { $sum: 1 },
          ratingDistribution: {
            $push: '$rating'
          },
          totalHelpfulVotes: { $sum: '$helpfulVotes' }
        }
      }
    ]);

    let ratingDistribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    if (stats.length > 0 && stats[0].ratingDistribution) {
      stats[0].ratingDistribution.forEach(rating => {
        ratingDistribution[rating] = (ratingDistribution[rating] || 0) + 1;
      });
    }

    res.json({
      success: true,
      statistics: {
        averageRating: stats.length > 0 ? parseFloat(stats[0].averageRating.toFixed(1)) : 0,
        totalReviews: stats.length > 0 ? stats[0].totalReviews : 0,
        totalHelpfulVotes: stats.length > 0 ? stats[0].totalHelpfulVotes : 0,
        ratingDistribution
      }
    });
  } catch (error) {
    console.error('Error fetching review stats:', error);
    res.status(500).json({ 
      success: false, 
      error: "Failed to fetch review statistics" 
    });
  }
};

// Admin: Verify review
export const verifyReview = async (req, res) => {
  try {
    const { reviewId } = req.params;
    
    // Check if user is admin
    if (req.user.role !== 'admin' && req.user.role !== 'teacher') {
      return res.status(403).json({
        success: false,
        error: "Only admins can verify reviews"
      });
    }

    const review = await Review.findById(reviewId);
    if (!review) {
      return res.status(404).json({
        success: false,
        error: "Review not found"
      });
    }

    review.verified = true;
    await review.save();

    res.json({
      success: true,
      message: "Review verified successfully",
      review
    });
  } catch (error) {
    console.error('Error verifying review:', error);
    res.status(500).json({ 
      success: false, 
      error: "Failed to verify review" 
    });
  }
};

// Admin: Feature review
export const featureReview = async (req, res) => {
  try {
    const { reviewId } = req.params;
    
    // Check if user is admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        error: "Only admins can feature reviews"
      });
    }

    const review = await Review.findById(reviewId);
    if (!review) {
      return res.status(404).json({
        success: false,
        error: "Review not found"
      });
    }

    // Unfeature other reviews if needed (optional: keep only 3 featured)
    if (req.body.featured === true) {
      const featuredCount = await Review.countDocuments({ featured: true });
      if (featuredCount >= 5) {
        // Unfeature the oldest featured review
        const oldestFeatured = await Review.findOne({ featured: true })
          .sort({ updatedAt: 1 })
          .limit(1);
        if (oldestFeatured) {
          oldestFeatured.featured = false;
          await oldestFeatured.save();
        }
      }
    }

    review.featured = req.body.featured !== undefined ? req.body.featured : !review.featured;
    await review.save();

    res.json({
      success: true,
      message: `Review ${review.featured ? 'featured' : 'unfeatured'} successfully`,
      review
    });
  } catch (error) {
    console.error('Error featuring review:', error);
    res.status(500).json({ 
      success: false, 
      error: "Failed to update review feature status" 
    });
  }
};

// Delete review (admin or owner)
export const deleteReview = async (req, res) => {
  try {
    const { reviewId } = req.params;
    
    const review = await Review.findById(reviewId);
    if (!review) {
      return res.status(404).json({
        success: false,
        error: "Review not found"
      });
    }

    // Check permissions
    const isOwner = review.user.toString() === req.user.id;
    const isAdmin = req.user.role === 'admin';
    
    if (!isOwner && !isAdmin) {
      return res.status(403).json({
        success: false,
        error: "You can only delete your own reviews"
      });
    }

    await Review.findByIdAndDelete(reviewId);

    // Update user's review count
    await User.findByIdAndUpdate(review.user, {
      $inc: { totalReviews: -1 }
    });

    res.json({
      success: true,
      message: "Review deleted successfully"
    });
  } catch (error) {
    console.error('Error deleting review:', error);
    res.status(500).json({ 
      success: false, 
      error: "Failed to delete review" 
    });
  }
};