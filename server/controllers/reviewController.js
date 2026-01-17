// server/controllers/reviewController.js
import Review from '../models/review.js';
import User from '../models/user.js';
import bcrypt from 'bcryptjs';

// Submit an authenticated review
export const submitReview = async (req, res) => {
  try {
    const {email, password, rating, title, content, tags = [] } = req.body;

    // Validate required fields
    if (!rating || !title || !content) {
      return res.status(400).json({
        success: false,
        message: 'Rating, title, and content are required'
      });
    }
    
    const isRegisteredUser = await User.findOne({email}, {password: 1});
    const isMatch = await bcrypt.compare(password, isRegisteredUser.password);
    if (!isRegisteredUser || !isMatch){
      return res.status(403).json({
        success: false,
        message: "No such user found or password incorrect!"
      })
    }
    const alreadyReviewed = await Review.find({email});
    
    if (alreadyReviewed.length !== 0) {
      console.log("review: " , alreadyReviewed);
      return res.status(409).json({
        success: false,
        message: 'You have already submitted a review'
      });    
    }

    // Create new review
    const review = await Review.create({
      email: email,
      rating,
      title,
      content,
      tags: tags
    });

    res.status(201).json({
      success: true,
      message: 'Review submitted successfully',
      data: review
    });

  } catch (error) {
    console.error('Review submission error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to submit review'
    });
  }
};

// Get all reviews
export const getReviews = async (req, res) => {
  try {
    const reviews = await Review.find()
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: reviews.length,
      data: reviews
    });
  } catch (error) {
    console.error('Get reviews error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch reviews'
    });
  }
};

// Get single review
export const getReviewById = async (req, res) => {
  try {
    const review = await Review.findById(req.params.id)
      .populate('user', 'name email');

    if (!review) {
      return res.status(404).json({
        success: false,
        message: 'Review not found'
      });
    }

    res.json({
      success: true,
      data: review
    });
  } catch (error) {
    console.error('Get review error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch review'
    });
  }
};

// Update review (only by owner)
export const updateReview = async (req, res) => {
  try {
    const { rating, title, content, tags } = req.body;
    
    const review = await Review.findById(req.params.id);

    if (!review) {
      return res.status(404).json({
        success: false,
        message: 'Review not found'
      });
    }

    // Check if user owns the review
    if (review.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this review'
      });
    }

    // Update fields
    review.rating = rating || review.rating;
    review.title = title || review.title;
    review.content = content || review.content;
    if (tags) review.tags = tags.slice(0, 5);

    await review.save();

    res.json({
      success: true,
      message: 'Review updated successfully',
      data: review
    });

  } catch (error) {
    console.error('Update review error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update review'
    });
  }
};

// Delete review (only by owner)
export const deleteReview = async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);

    if (!review) {
      return res.status(404).json({
        success: false,
        message: 'Review not found'
      });
    }

    // Check if user owns the review
    if (review.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this review'
      });
    }

    await review.deleteOne();

    res.json({
      success: true,
      message: 'Review deleted successfully'
    });

  } catch (error) {
    console.error('Delete review error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete review'
    });
  }
};