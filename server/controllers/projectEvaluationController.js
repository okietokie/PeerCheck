// controllers/projectEvaluationController.js
import ProjectEvaluation from "../models/projectEvaluation.js";
import Project from "../models/projects.js";
import { createNotification } from './notificationController.js';
import PeerReview from "../models/peerReview.js";

// Submit project evaluation
export const submitProjectEvaluation = async (req, res) => {
  try {
    const {
      projectId,
      evaluatorRole,
      grading,
      memberEvaluations
    } = req.body;
    const evaluator = req.user.id;
    console.log("evalutation data: ",      projectId,
      evaluatorRole,
      grading,
      memberEvaluations );
    // Validate required fields
    if (!projectId || !evaluatorRole || !grading) {
      return res.status(400).json({ 
        success: false, 
        error: "Missing required fields" 
      });
    }
    // Check if project exists
    const projectExists = await Project.findById(projectId);
    if (!projectExists) {
      return res.status(404).json({ 
        success: false, 
        error: "Project not found" 
      });
    }
    // Check if user has already evaluated this project
    const existingEvaluation = await ProjectEvaluation.findOne({
      projectId,
      evaluator
    });
    if (existingEvaluation) {
      return res.status(400).json({ 
        success: false, 
        error: "You have already evaluated this project" 
      });
    }
    const categoryScores = [
      grading.technicalExecution?.score || 0,
      grading.taskValidity?.score || 0,
      grading.timeAuthenticity?.score || 0,
      grading.teamwork?.score || 0,
      grading.documentationQuality?.score || 0
    ];
    const finalScore = categoryScores.reduce((sum, score) => sum + score, 0);
    // Detect suspicion flags
    const suspicionFlags = {
      paddedTasksDetected: false,
      unrealisticTimeLogs: false,
      copyPasteWork: false,
      comment: ''
    };
      // Create the evaluation
    const evaluation = new ProjectEvaluation({
      projectId,
      evaluatedTeam: projectExists.teamName || "Unnamed Team",
      evaluator,
      evaluatorRole,
      grading,
      suspicionFlags,
      finalScore
    });

    await evaluation.save();
    // Populate references for response
    const populatedEvaluation = await ProjectEvaluation.findById(evaluation._id)
      .populate('projectId', 'projectName')
      .populate('evaluator', 'name email')
      .populate('memberEvaluations.member', 'name email');

    // Create notification for project creator
    if (projectExists.createdBy && projectExists.createdBy.toString() !== evaluator.toString()) {
      await createNotification({
        userId: projectExists.createdBy,
        type: 'project_evaluated',
        title: 'Project Evaluated',
        message: `${req.user.name} has evaluated your project "${projectExists.projectName}"`,
        data: {
          projectId: projectId,
          projectName: projectExists.projectName,
          evaluatorId: evaluator,
          evaluatorRole,
          finalScore
        },
        priority: 'medium',
        actionUrl: `/projects/${projectId}/evaluations`
      });
    }

    res.status(201).json({
      success: true,
      message: "Evaluation submitted successfully",
      evaluation: populatedEvaluation
    });

  } catch (error) {
    console.error('Error submitting evaluation:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
};

// Get evaluations for a project
export const getProjectEvaluations = async (req, res) => {
  try {
    const { projectId } = req.params;
    const userId = req.user.id;

    // Check if user has access to the project
    const project = await Project.findById(projectId)
      .populate('teamId', 'members');

    if (!project) {
      return res.status(404).json({ 
        success: false, 
        error: "Project not found" 
      });
    }

    // Check access
    const isCreator = project.createdBy.toString() === userId;
    const isTeamMember = project.teamId?.members.some(
      member => member._id.toString() === userId
    );
    const isTeacher = req.user.role === 'teacher';

    if (!isCreator && !isTeamMember && !isTeacher) {
      return res.status(403).json({ 
        success: false, 
        error: "Access denied" 
      });
    }

    // Get evaluations
    const evaluations = await ProjectEvaluation.find({ project: projectId })
      .populate('evaluator', 'name email role avatar')
      .populate('memberEvaluations.member', 'name email avatar')
      .sort({ submittedAt: -1 });

    // Calculate average scores
    const averageScores = {
      technicalExecution: 0,
      taskValidity: 0,
      timeAuthenticity: 0,
      teamwork: 0,
      documentationQuality: 0,
      finalScore: 0
    };

    if (evaluations.length > 0) {
      evaluations.forEach(evaluation => {
        averageScores.technicalExecution += evaluation.grading.technicalExecution?.score || 0;
        averageScores.taskValidity += evaluation.grading.taskValidity?.score || 0;
        averageScores.timeAuthenticity += evaluation.grading.timeAuthenticity?.score || 0;
        averageScores.teamwork += evaluation.grading.teamwork?.score || 0;
        averageScores.documentationQuality += evaluation.grading.documentationQuality?.score || 0;
        averageScores.finalScore += evaluation.finalScore || 0;
      });

      // Calculate averages
      Object.keys(averageScores).forEach(key => {
        averageScores[key] = parseFloat((averageScores[key] / evaluations.length).toFixed(2));
      });
    }

    res.json({
      success: true,
      evaluations,
      summary: {
        totalEvaluations: evaluations.length,
        averageScores,
        peerEvaluations: evaluations.filter(e => e.evaluatorRole === 'peer').length,
        teacherEvaluations: evaluations.filter(e => e.evaluatorRole === 'teacher').length
      }
    });

  } catch (error) {
    console.error('Error getting evaluations:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
};


// Get member evaluation summary
export const getMemberEvaluationSummary = async (req, res) => {
  try {
    const { projectId } = req.params;
    const { memberId } = req.query;

    // Get project with team members
    const project = await Project.findById(projectId)
      .populate({
        path: 'teamId',
        populate: {
          path: 'members',
          select: 'name email avatar'
        }
      });

    if (!project) {
      return res.status(404).json({
        success: false,
        message: "Project not found"
      });
    }

    const teamMembers = project.teamId?.members || [];

    // Get all project evaluations (whole team evaluations)
    const projectEvaluations = await ProjectEvaluation.find({ 
      projectId: projectId
    })
    .populate('evaluator', 'name email role avatar');

    // Get all peer reviews (individual member reviews)
    const peerReviews = await PeerReview.find({ projectId })
      .populate('reviewer', 'name email avatar')
      .populate('reviewee', 'name email avatar');

    // Create summary for each team member
    const memberSummary = {};

    // Initialize summary for each team member
    teamMembers.forEach(member => {
      const memberIdStr = member._id.toString();
      memberSummary[memberIdStr] = {
        member: {
          _id: member._id,
          name: member.name,
          email: member.email,
          avatar: member.avatar
        },
        projectEvaluationScore: 0,
        peerReviewScore: 0,
        finalScore: 0,
        totalProjectEvaluations: 0,
        totalPeerReviews: 0,
        projectEvaluationComments: [], // Comments from project evaluations
        peerReviews: [] // Individual peer reviews about member
      };
    });

    // Process PROJECT EVALUATIONS
    projectEvaluations.forEach(evaluation => {
      // Calculate average score from all categories for this evaluation
      const categoryScores = evaluation.grading ? [
        evaluation.grading.technicalExecution?.score || 0,
        evaluation.grading.taskValidity?.score || 0,
        evaluation.grading.timeAuthenticity?.score || 0,
        evaluation.grading.teamwork?.score || 0,
        evaluation.grading.documentationQuality?.score || 0
      ] : [];
      
      const evaluationAverage = categoryScores.length > 0 
        ? categoryScores.reduce((sum, score) => sum + score, 0) / categoryScores.length
        : 0;

      // Collect comments from this evaluation
      const evaluationComments = [];
        if (evaluation.grading) {
          Object.entries(evaluation.grading).forEach(([category, data]) => {
            if (data && data.comment) {
              evaluationComments.push({
                category: category.charAt(0).toUpperCase() + category.slice(1).replace(/([A-Z])/g, ' $1'),
                comment: data.comment,
                score: data.score || 0,
                evaluator: evaluation.evaluator,
                evaluatorRole: evaluation.evaluatorRole,
                evaluatedAt: evaluation.createdAt,
                type: 'project_evaluation'
              });
            }
          });
        }

      // evaluation added to all team members (since it's a team evaluation)
      teamMembers.forEach(member => {
        const memberIdStr = member._id.toString();
        
        if (memberSummary[memberIdStr]) {
          memberSummary[memberIdStr].projectEvaluationScore += evaluationAverage;
          memberSummary[memberIdStr].totalProjectEvaluations += 1;
          
          // Add comments
          evaluationComments.forEach(comment => {
            memberSummary[memberIdStr].projectEvaluationComments.push(comment);
          });
        }
      });
    });

    peerReviews.forEach(review => {
      const revieweeId = review.reviewee?._id?.toString();
      
      if (revieweeId && memberSummary[revieweeId]) {
        const peerReviewData = {
          reviewer: review.reviewer,
          scores: review.scores,
          comment: review.comment,
          totalScore: review.totalScore,
          submittedAt: review.submittedAt,
          type: 'peer_review'
        };
        
        memberSummary[revieweeId].peerReviews.push(peerReviewData);
        memberSummary[revieweeId].peerReviewScore += review.totalScore;
        memberSummary[revieweeId].totalPeerReviews += 1;
      }
    });

    // Calculate averages and final scores
    const summaryArray = Object.values(memberSummary);
    
    summaryArray.forEach(member => {
      // Calculate project evaluation average
      const projectEvalAvg = member.totalProjectEvaluations > 0 
        ? member.projectEvaluationScore / member.totalProjectEvaluations
        : 0;
      
      // Calculate peer review average
      const peerReviewAvg = member.totalPeerReviews > 0 
        ? member.peerReviewScore / member.totalPeerReviews
        : 0;
      
      // Combine scores
      // 30% project evaluation + 70% peer reviews
      const projectWeight = 0.3;
      const peerWeight = 0.7;
      
      member.projectEvaluationAverage = parseFloat(projectEvalAvg.toFixed(2));
      member.peerReviewAverage = parseFloat(peerReviewAvg.toFixed(2));

      member.finalScore = parseFloat((
        (projectEvalAvg * projectWeight) +
        ((peerReviewAvg * 2) * peerWeight)
      ).toFixed(2));

      // Group project evaluation comments by evaluator
      const commentsByEvaluator = {};
      member.projectEvaluationComments.forEach(comment => {
        const evaluatorId = comment.evaluator._id.toString();
        if (!commentsByEvaluator[evaluatorId]) {
          commentsByEvaluator[evaluatorId] = {
            evaluator: comment.evaluator,
            evaluatorRole: comment.evaluatorRole,
            comments: [],
            categories: [],
            averageScore: 0
          };
        }
        
        commentsByEvaluator[evaluatorId].comments.push(comment.comment);
        commentsByEvaluator[evaluatorId].categories.push({
          name: comment.category,
          score: comment.score
        });
      });
      
      // Calculate average score per evaluator
      Object.values(commentsByEvaluator).forEach(evaluatorData => {
        const totalScore = evaluatorData.categories.reduce((sum, cat) => sum + cat.score, 0);
        evaluatorData.averageScore = totalScore / evaluatorData.categories.length;
      });
      
      member.commentsByEvaluator = Object.values(commentsByEvaluator);
      member.totalProjectComments = member.projectEvaluationComments.length;
    });

    // Sort by final score
    summaryArray.sort((a, b) => b.finalScore - a.finalScore);

    // Filter for specific member if requested
    let result = summaryArray;
    if (memberId) {
      result = summaryArray.filter(item => 
        item.member._id.toString() === memberId
      );
    }

    res.json({
      success: true,
      summary: result,
      totalMembers: summaryArray.length,
      stats: {
        totalProjectEvaluations: projectEvaluations.length,
        totalPeerReviews: peerReviews.length
      }
    });

  } catch (error) {
    console.error('Error getting member evaluation summary:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
};
// Delete evaluation (admin/evaluator only)
export const deleteEvaluation = async (req, res) => {
  try {
    const { evaluationId } = req.params;
    const userId = req.user.id;

    const evaluation = await ProjectEvaluation.findById(evaluationId);

    if (!evaluation) {
      return res.status(404).json({ 
        success: false, 
        error: "Evaluation not found" 
      });
    }

    // Check permissions
    const isEvaluator = evaluation.evaluator.toString() === userId;
    const isAdmin = req.user.role === 'admin';

    if (!isEvaluator && !isAdmin) {
      return res.status(403).json({ 
        success: false, 
        error: "Not authorized to delete this evaluation" 
      });
    }

    await ProjectEvaluation.findByIdAndDelete(evaluationId);

    res.json({
      success: true,
      message: "Evaluation deleted successfully"
    });

  } catch (error) {
    console.error('Error deleting evaluation:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
};