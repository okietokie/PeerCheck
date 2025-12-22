// controllers/peerReviewController.js
import PeerReview from '../models/peerReview.js';
import Project from '../models/projects.js';
import Task from '../models/tasks.js';


/**
 * Apply peer score to grading
 * Uses peer score in final grade calculation
 */
export const applyPeerScoreToGrading = async (req, res) => {
  try {
    const { projectId } = req.params;
    const { 
      taskCompletionWeight = 40,
      peerScoreWeight = 30,
      teacherReviewWeight = 30
    } = req.body;

    // Validate weights
    const totalWeight = taskCompletionWeight + peerScoreWeight + teacherReviewWeight;
    if (totalWeight !== 100) {
      return res.status(400).json({
        success: false,
        message: 'Weights must sum to 100%'
      });
    }

    const project = await Project.findById(projectId)
      .populate('members.userId', 'name email')
      .populate('tasks');

    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found'
      });
    }

    // Calculate grades for each member
    const grades = [];
    const members = project.teamId.members;
    const tasks = project.tasks || [];

    members.forEach(member => {
      const memberId = member.userId._id.toString();
      
      // 1. Task completion score (0-100)
      const memberTasks = tasks.filter(task => task.assignedTo.toString() === memberId);
      const completedTasks = memberTasks.filter(task => task.status === 'completed').length;
      const taskCompletionScore = memberTasks.length > 0 
        ? (completedTasks / memberTasks.length) * 100 
        : 0;

      // 2. Peer review score (0-100)
      const peerScore = project.metrics?.peerReview?.members?.[memberId]?.normalizedScore || 0;

      // 3. Teacher review score (0-100) - would come from separate evaluation
      const teacherScore = member.teacherEvaluation?.score || 0;

      // Calculate final grade
      const finalGrade = (
        (taskCompletionScore * taskCompletionWeight / 100) +
        (peerScore * peerScoreWeight / 100) +
        (teacherScore * teacherReviewWeight / 100)
      );

      grades.push({
        userId: memberId,
        name: member.userId.name,
        scores: {
          taskCompletion: parseFloat(taskCompletionScore.toFixed(2)),
          peerScore: parseFloat(peerScore.toFixed(2)),
          teacherScore: parseFloat(teacherScore.toFixed(2))
        },
        weights: {
          taskCompletion: taskCompletionWeight,
          peerScore: peerScoreWeight,
          teacherReview: teacherReviewWeight
        },
        finalGrade: parseFloat(finalGrade.toFixed(2)),
        gradeLetter: calculateGradeLetter(finalGrade)
      });
    });

    // Save grades to project
    project.grades = grades;
    project.gradesCalculatedAt = new Date();
    await project.save();

    res.status(200).json({
      success: true,
      message: 'Grades calculated successfully',
      data: {
        weights: {
          taskCompletion: taskCompletionWeight,
          peerScore: peerScoreWeight,
          teacherReview: teacherReviewWeight
        },
        grades
      }
    });

  } catch (error) {
    console.error('Apply peer score to grading error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to calculate grades',
      error: error.message
    });
  }
};

// Helper function for grade letter
const calculateGradeLetter = (score) => {
  if (score >= 90) return 'A';
  if (score >= 80) return 'B';
  if (score >= 70) return 'C';
  if (score >= 60) return 'D';
  return 'F';
};

/**
 * Get aggregated scores for dashboard
 */
export const getAggregatedScores = async (req, res) => {
  try {
    const { projectId } = req.params;
    
    const result = await aggregatePeerScoresForProject(projectId);
    
    if (!result.success) {
      return res.status(404).json(result);
    }

    res.status(200).json(result);
  } catch (error) {
    console.error('Get aggregated scores error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch aggregated scores',
      error: error.message
    });
  }
};

/**
 * Check if user can submit review
 */
export const canSubmitReview = async (req, res) => {
  try {
    const { projectId, revieweeId } = req.params;
    const reviewerId = req.user.id;

    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found'
      });
    }

    // Check if peer reviews are locked
    if (project.peerReviewLocked) {
      return res.status(403).json({
        success: false,
        canSubmit: false,
        reason: 'Peer reviews are locked for this project'
      });
    }

    // Check for existing review
    const existingReview = await PeerReview.findOne({
      projectId,
      reviewer: reviewerId,
      reviewee: revieweeId
    });

    const canSubmit = !existingReview && reviewerId !== revieweeId;

    res.status(200).json({
      success: true,
      canSubmit,
      existingReviewId: existingReview?._id,
      message: canSubmit ? 'Can submit review' : 'Cannot submit review'
    });

  } catch (error) {
    console.error('Check review submission error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to check review submission status',
      error: error.message
    });
  }
};


export const submitPeerReview = async (req, res) => {
  try {
    const { projectId, revieweeId, scores, comment } = req.body;
    const reviewerId = req.user.id;

    console.log("req.body", req.body);

    const project = await Project.findById(projectId)
      .populate({
        path: 'teamId',
        select: 'members'
      });

    const members = project.teamId.members.map(id => id.toString());

    const existingReview = await PeerReview.findOne({
      projectId,
      reviewer: reviewerId,
      reviewee: revieweeId
    });

    const { contribution, collaboration, quality, punctuality } = scores;
    const values = [contribution, collaboration, quality, punctuality];

    //validation
    if (reviewerId === revieweeId) {
      return res.status(400).json({ success: false, message: 'You cannot review yourself' });
    }
    if (!project) {
      return res.status(404).json({ success: false, message: 'Project not found' });
    }
    if (!members.includes(reviewerId.toString())) {
      return res.status(403).json({ success: false, message: 'Reviewer must be a project member' });
    }
    if (existingReview) {
      return res.status(409).json({ success: false, message: 'Already reviewed this member' });
    }
    if (values.some(v => v < 1 || v > 5)) {
      return res.status(400).json({ success: false, message: 'Scores must be between 1 and 5' });
    }


    //calculate totalScore
    //const totalScore = (contribution + collaboration + quality + punctuality) / 4;
    const totalScore = values.reduce((a, b) => a + b, 0) / values.length; 
    //values = [contribution, collaboration, quality, punctuality]

    const peerReview = await PeerReview.create({
      projectId,
      reviewer: reviewerId,
      reviewee: revieweeId,
      scores,
      comment,
      totalScore
    });

    await updateProjectPeerMetrics(projectId);

    res.status(201).json({
      success: true,
      message: 'Peer review submitted',
      data: { id: peerReview._id, totalScore }
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: err.message });
  }
};

export const getPeerReviewsForProject = async (req, res) => {
  try {
    const { projectId } = req.params;
    const reviews = await PeerReview.find({ projectId })
      .populate('reviewer', 'name email')
      .populate('reviewee', 'name email')
      .sort({ submittedAt: -1 });
    res.status(200).json({ success: true, count: reviews.length, data: reviews });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/**
 * compute average peer review scores for each member of a project
 */
export const aggregatePeerScoresForProject = async (projectId) => {
  const reviews = await PeerReview.find({ projectId }).populate('reviewee', 'name');

  if (!reviews.length) {
    return { success: false, message: 'No peer reviews found' };
  }

  const members = {};

  reviews.forEach(r => {
    const id = r.reviewee._id.toString();
    if (!members[id]) {
      members[id] = { name: r.reviewee.name, scores: [] };
    }
    members[id].scores.push(r.totalScore);
  });

  const results = {};

  Object.entries(members).forEach(([id, data]) => {
    const avg = data.scores.reduce((a, b) => a + b, 0) / data.scores.length;
    results[id] = {
      name: data.name,
      averageScore: +avg.toFixed(2),
      normalizedScore: +((avg / 5) * 100).toFixed(2),
      reviewCount: data.scores.length
    };
  });



  return {
    success: true,
    data: {
      members: results,
      summary: {
        totalReviews: reviews.length,
        membersReviewed: Object.keys(results).length
      }
    }
  };
};


export const updateProjectPeerMetrics = async (projectId) => {
  const result = await aggregatePeerScoresForProject(projectId);
  if (!result.success) return result;

  const project = await Project.findByIdAndUpdate(
    projectId,
    {
      $set: {
        'metrics.peerReviewPerMember': {
          members: result.data.members,
          summary: result.data.summary,
          lastUpdated: new Date()
        }
      }
    },
    { new: true }
  );

  await detectFreeRiders(projectId);

  return { success: true, data: project.metrics.peerReviewPerMember };
};


export const detectFreeRiders = async (projectId) => {
  const project = await Project.findById(projectId).populate({
    path: 'teamId',
    populate: { path: 'members', select: 'username' }
  });

  if (!project) return;

  const members = project.teamId.members;
  const tasks = await Task.find({ projectId });

  const peerMetrics = project.metrics?.peerReviewPerMember?.members || {};
  const freeRiders = [];

  members.forEach(member => {
    const id = member._id.toString();

    const assigned = tasks.filter(t => t.assignedTo?.toString() === id);
    const completed = assigned.filter(t => t.status === 'completed').length;

    const peerScore = peerMetrics[id]?.averageScore ?? 0;

    if (peerScore < 2.5 && completed === 0) {
      freeRiders.push({
        userId: id,
        name: member.name,
        reason: 'Low peer score and no completed tasks'
      });
    }
  });

  await Project.findByIdAndUpdate(projectId, {
    $set: {
      'metrics.freeRiders': freeRiders,
      'metrics.freeRiderCheckedAt': new Date(),
      'metrics.contributorFairness.freeRiderRisk': true,
    }
  });

  return { success: true, freeRiders };
};


export const lockPeerReviews = async (req, res) => {
  const { projectId } = req.params;
  const { lock } = req.body;

  const project = await Project.findByIdAndUpdate(
    projectId,
    {
      peerReviewLocked: lock,
      peerReviewLockedAt: lock ? new Date() : null,
      peerReviewLockedBy: req.user.id
    },
    { new: true }
  );

  res.json({ success: true, locked: project.peerReviewLocked });
};


export const getPeerScoreForUser = async (req, res) => {
  const { projectId } = req.params;
  const userId = req.user.id;

  const reviews = await PeerReview.find({ projectId, reviewee: userId })
    .populate('reviewer', 'name');

  const avg =
    reviews.reduce((s, r) => s + r.totalScore, 0) / (reviews.length || 1);
  const contribution =
    reviews.reduce((s, r) => s + r.scores.contribution, 0) / (reviews.length || 1);
  const collaboration =
    reviews.reduce((s, r) => s + r.scores.collaboration, 0) / (reviews.length || 1);
  const quality =
    reviews.reduce((s, r) => s + r.scores.quality, 0) / (reviews.length || 1);
  const punctuality =
    reviews.reduce((s, r) => s + r.scores.punctuality, 0) / (reviews.length || 1);

  const rev = reviews.map(r => r.comment);

  res.json({
    success: true,
    data: {
      averageScore: +avg.toFixed(2),
      normalizedScore: +((avg / 5) * 100).toFixed(2),
      reviewCount: reviews.length,
      criteriaScores: {
        contribution: contribution,
        collaboration: collaboration,
        quality: quality,
        punctuality: punctuality
      },
      reviews: rev || [],
    }
  });
};

export const checkPeerReviewCompletion = async (req, res) => {
  try {
    const { projectId } = req.params;
    
    const project = await Project.findById(projectId)
      .populate({
        path: 'teamId',
        populate: {
          path: 'members.userId',
          select: 'name email'
        }
      });

    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found'
      });
    }

    const members = project.teamId.members || [];
    const memberIds = members.map(m => m.userId._id.toString());
    
    // Get all submitted reviews
    const reviews = await PeerReview.find({ projectId });
    
    // Create a matrix of who has reviewed whom
    const reviewMatrix = {};
    memberIds.forEach(reviewerId => {
      reviewMatrix[reviewerId] = {};
      memberIds.forEach(revieweeId => {
        if (reviewerId !== revieweeId) {
          const hasReviewed = reviews.some(review => 
            review.reviewer.toString() === reviewerId && 
            review.reviewee.toString() === revieweeId
          );
          reviewMatrix[reviewerId][revieweeId] = hasReviewed;
        }
      });
    });

    // Calculate completion stats
    const totalPossibleReviews = memberIds.length * (memberIds.length - 1);
    let completedReviews = 0;
    
    Object.keys(reviewMatrix).forEach(reviewerId => {
      Object.keys(reviewMatrix[reviewerId]).forEach(revieweeId => {
        if (reviewMatrix[reviewerId][revieweeId]) {
          completedReviews++;
        }
      });
    });

    const completionPercentage = totalPossibleReviews > 0 
      ? Math.round((completedReviews / totalPossibleReviews) * 100)
      : 0;

    // Check if all reviews are completed
    const isCompleted = completedReviews === totalPossibleReviews;
    
    // Get individual member completion status
    const memberCompletion = memberIds.map(memberId => {
      const reviewsNeeded = memberIds.length - 1; // Can't review self
      const reviewsCompleted = reviews.filter(
        review => review.reviewer.toString() === memberId
      ).length;
      
      return {
        userId: memberId,
        name: members.find(m => m.userId._id.toString() === memberId)?.userId?.name || 'Unknown',
        reviewsNeeded,
        reviewsCompleted,
        isComplete: reviewsCompleted === reviewsNeeded
      };
    });

    res.status(200).json({
      success: true,
      data: {
        isCompleted,
        completionPercentage,
        stats: {
          totalMembers: memberIds.length,
          totalPossibleReviews,
          completedReviews,
          remainingReviews: totalPossibleReviews - completedReviews
        },
        memberCompletion,
        reviewMatrix,
        lockStatus: {
          isLocked: project.peerReviewLocked || false,
          lockedAt: project.peerReviewLockedAt,
          lockedBy: project.peerReviewLockedBy
        }
      }
    });

  } catch (error) {
    console.error('Check peer review completion error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to check peer review completion',
      error: error.message
    });
  }
};