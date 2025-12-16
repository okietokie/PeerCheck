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

    if (reviewerId === revieweeId) {
      return res.status(400).json({ success: false, message: 'You cannot review yourself' });
    }

    const project = await Project.findById(projectId).populate({
      path: 'teamId',
      select: 'members'
    });

    if (!project) {
      return res.status(404).json({ success: false, message: 'Project not found' });
    }

    const members = project.teamId.members.map(id => id.toString());

    if (!members.includes(reviewerId.toString())) {
      return res.status(403).json({ success: false, message: 'Reviewer must be a project member' });
    }

    if (!members.includes(revieweeId.toString())) {
      return res.status(403).json({ success: false, message: 'Reviewee must be a project member' });
    }

    const existingReview = await PeerReview.findOne({
      projectId,
      reviewer: reviewerId,
      reviewee: revieweeId
    });

    if (existingReview) {
      return res.status(409).json({ success: false, message: 'Already reviewed this member' });
    }

    const { contribution, collaboration, quality, punctuality } = scores;
    const values = [contribution, collaboration, quality, punctuality];

    if (values.some(v => v < 1 || v > 5)) {
      return res.status(400).json({ success: false, message: 'Scores must be between 1 and 5' });
    }

    const totalScore = values.reduce((a, b) => a + b, 0) / values.length;

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
        'metrics.peerReview': {
          members: result.data.members,
          summary: result.data.summary,
          lastUpdated: new Date()
        }
      }
    },
    { new: true }
  );

  await detectFreeRiders(projectId);

  return { success: true, data: project.metrics.peerReview };
};


export const detectFreeRiders = async (projectId) => {
  const project = await Project.findById(projectId).populate({
    path: 'teamId',
    populate: { path: 'members', select: 'name' }
  });

  if (!project) return;

  const members = project.teamId.members;
  const tasks = await Task.find({ projectId });

  const peerMetrics = project.metrics?.peerReview?.members || {};
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
      'metrics.freeRiderCheckedAt': new Date()
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

  res.json({
    success: true,
    data: {
      averageScore: +avg.toFixed(2),
      normalizedScore: +((avg / 5) * 100).toFixed(2),
      reviewCount: reviews.length
    }
  });
};
