import mongoose from 'mongoose';

const reviewSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    lowercase: true
  },
  
  rating: {
    type: Number,
    required: true,
    min: 1,
    max: 5
  },
  
  title: {
    type: String,
    required: true,
    trim: true
  },
  
  content: {
    type: String,
    required: true,
    trim: true
  },
  
  tags: [{
    type: String,
    trim: true
  }],
  
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const Review = mongoose.model('Review', reviewSchema);

export default Review;