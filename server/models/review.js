import mongoose from "mongoose";

const reviewSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
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
      trim: true,
      maxlength: 100
    },
    content: {
      type: String,
      required: true,
      trim: true,
      maxlength: 500
    },
    category: {
      type: String,
      enum: ['general', 'feedback', 'suggestion', 'testimonial'],
      default: 'general'
    },
    verified: {
      type: Boolean,
      default: false
    },
    helpfulVotes: {
      type: Number,
      default: 0
    },
    featured: {
      type: Boolean,
      default: false
    },
    tags: [{
      type: String,
      trim: true
    }],
    ipAddress: String,
    userAgent: String
  },
  { 
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

// Add indexes for faster queries
reviewSchema.index({ rating: -1, createdAt: -1 });
reviewSchema.index({ user: 1, createdAt: -1 });
reviewSchema.index({ featured: -1, createdAt: -1 });
reviewSchema.index({ helpfulVotes: -1 });

// Virtual field for formatted date
reviewSchema.virtual('formattedDate').get(function() {
  return this.createdAt.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
});

// Virtual field for user details (populated)
reviewSchema.virtual('userDetails', {
  ref: 'User',
  localField: 'user',
  foreignField: '_id',
  justOne: true
});

// Pre-save middleware to ensure data integrity
reviewSchema.pre('save', function(next) {
  if (this.content) {
    this.content = this.content.trim();
  }
  if (this.title) {
    this.title = this.title.trim();
  }
  next();
});

// Static method to get average rating
reviewSchema.statics.getAverageRating = async function() {
  const result = await this.aggregate([
    {
      $match: { verified: true }
    },
    {
      $group: {
        _id: null,
        averageRating: { $avg: '$rating' },
        totalReviews: { $sum: 1 }
      }
    }
  ]);
  
  return result.length > 0 ? {
    averageRating: parseFloat(result[0].averageRating.toFixed(1)),
    totalReviews: result[0].totalReviews
  } : { averageRating: 0, totalReviews: 0 };
};

// Static method to get recent featured reviews
reviewSchema.statics.getFeaturedReviews = async function(limit = 3) {
  return await this.find({ featured: true, verified: true })
    .populate('user', 'name email avatar username')
    .sort({ createdAt: -1 })
    .limit(limit)
    .lean();
};

// Static method to get helpful reviews
reviewSchema.statics.getHelpfulReviews = async function(limit = 3) {
  return await this.find({ verified: true })
    .populate('user', 'name email avatar username')
    .sort({ helpfulVotes: -1, createdAt: -1 })
    .limit(limit)
    .lean();
};

const Review = mongoose.model("Review", reviewSchema);

export default Review;