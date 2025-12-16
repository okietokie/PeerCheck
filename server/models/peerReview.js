import mongoose from 'mongoose';

const peerReviewSchema = new mongoose.Schema({
  projectId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Project',
    required: true
  },

  reviewer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },

  reviewee: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },

  scores: {
    contribution: { type: Number, min: 1, max: 5, required: true },
    collaboration: { type: Number, min: 1, max: 5, required: true },
    quality: { type: Number, min: 1, max: 5, required: true },
    punctuality: { type: Number, min: 1, max: 5, required: true }
  },

  comment: { type: String },

  totalScore: { type: Number }, // calculated

  submittedAt: {
    type: Date,
    default: Date.now
  }
});

peerReviewSchema.index(
  { projectId: 1, reviewer: 1, reviewee: 1 },
  { unique: true }
);

const PeerReview = mongoose.model('PeerReviews', peerReviewSchema);
export default PeerReview;