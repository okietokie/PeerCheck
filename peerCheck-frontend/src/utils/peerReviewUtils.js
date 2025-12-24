
export const canReviewMember = (memberId, userId, peerReviews) => {
  if (!userId || !peerReviews) return false;
  
  // User can't review themselves
  if (memberId === userId) return false;
  
  // Check if user has already reviewed this member
  const existingReview = peerReviews.find(review => 
    review.reviewer._id === userId && review.reviewee._id === memberId
  );
  
  return !existingReview;
};

export const calculateAverageScore = (scores) => {
  if (!scores) return 0;
  const values = Object.values(scores);
  return values.reduce((a, b) => a + b, 0) / values.length;
};

export const getReviewStatus = (memberId, userId, peerReviews, canReview) => {
  if (memberId === userId) return 'self';
  if (!canReview && memberId !== userId) return 'reviewed';
  if (canReview) return 'needs_review';
  return null;
};

