import Task from "../models/tasks.js";
import User from "../models/user.js";
import PeerReview from '../models/peerReview.js';
import ProjectEvaluation from "../models/projectEvaluation.js";
import Project from "../models/projects.js";
import { enrichTaskWithMetrics } from './taskController.js';
import Team from "../models/peergroup_log.js";

export const updateUserProductivity = async (userId) => {
  try {
    const user = await User.findById(userId);
    if (!user) return null;

    // Get users tasks
    const tasks = await Task.find({ assignedTo: userId })
      .populate('projectId', 'projectName')
      .lean();

    // Get all projects user is part of
    const userProjects = await Project.find({
      'teamId.members': userId
    }).select('_id projectName teamId');

    const projectIds = userProjects.map(p => p._id);

    // Get peer reviews for user across all projects
    const peerReviews = await PeerReview.find({ 
      reviewee: userId,
      projectId: { $in: projectIds }
    }).populate('reviewer', 'name email avatar');

    // Get project evaluations for projects user is in
    const projectEvaluations = await ProjectEvaluation.find({
      projectId: { $in: projectIds },
      'memberEvaluations.member': userId
    });

    if (tasks.length === 0 && peerReviews.length === 0 && projectEvaluations.length === 0) {
      user.productivity = {
        tasksAssigned: 0,
        tasksCompleted: 0,
        totalFocusTime: 0,
        overallEfficiency: 0,
        averageRiskScore: 0,
        onTimeRate: 0,
        peerReviewScore: 0,
        projectEvaluationScore: 0,
        collaborationScore: 0,
        projectsContributed: [],
        lastUpdated: new Date()
      };
      await user.save();
      return user.productivity;
    }

    // Enrich tasks with metrics
    const enrichedTasks = tasks.map(task => enrichTaskWithMetrics(task)).filter(t => t);
    const completedTasks = enrichedTasks.filter(t => t.status === 'completed');
    const totalFocusTime = enrichedTasks.reduce((sum, t) => sum + (t.totalFocusTime || 0), 0);
    const totalEstimatedTime = enrichedTasks.reduce((sum, t) => sum + (t.estimatedTime || 0), 0);
    
    // Calculate task-based efficiency
    const overallEfficiency = enrichedTasks.length > 0 
      ? enrichedTasks.reduce((sum, t) => sum + (t.metrics?.efficiency || 0), 0) / enrichedTasks.length 
      : 0;

    // Calculate risk scores
    const riskScores = enrichedTasks.map(task => task.metrics?.riskScore || 0);
    const averageRiskScore = riskScores.length > 0 
      ? riskScores.reduce((sum, s) => sum + s, 0) / riskScores.length 
      : 0;

    // Calculate on-time rate
    const onTimeTasks = completedTasks.filter(task => {
      if (!task.endDate || !task.deadline) return false;
      return new Date(task.endDate) <= new Date(task.deadline);
    });
    
    const onTimeRate = completedTasks.length > 0 
      ? (onTimeTasks.length / completedTasks.length) * 100 
      : 0;

    // peer review metrics
    let peerReviewScore = 0;
    let collaborationScore = 0;
    let peerReviewBreakdown = {
      contribution: 0,
      collaboration: 0,
      quality: 0,
      punctuality: 0
    };

    if (peerReviews.length > 0) {
      // average peer review score (1-5 scale, convert to 0-100)
      peerReviewScore = peerReviews.reduce((sum, review) => sum + (review.totalScore || 0), 0) / peerReviews.length;
      
      // collaboration score (average of collaboration ratings)
      collaborationScore = peerReviews.reduce((sum, review) => sum + (review.scores?.collaboration || 0), 0) / peerReviews.length;
      
      // breakdown
      peerReviewBreakdown.contribution = peerReviews.reduce((sum, r) => sum + (r.scores?.contribution || 0), 0) / peerReviews.length;
      peerReviewBreakdown.collaboration = collaborationScore;
      peerReviewBreakdown.quality = peerReviews.reduce((sum, r) => sum + (r.scores?.quality || 0), 0) / peerReviews.length;
      peerReviewBreakdown.punctuality = peerReviews.reduce((sum, r) => sum + (r.scores?.punctuality || 0), 0) / peerReviews.length;
    }

    // project evaluation metrics
    let projectEvaluationScore = 0;
    let evaluationBreakdown = {
      technicalExecution: 0,
      taskValidity: 0,
      timeAuthenticity: 0,
      teamwork: 0,
      documentationQuality: 0
    };

    if (projectEvaluations.length > 0) {
      let totalEvaluations = 0;
      
      projectEvaluations.forEach(evaluation => {

        const memberEval = evaluation.memberEvaluations?.find(me => 
          me.member?.toString() === userId || me.member?._id?.toString() === userId
        );
        
        if (memberEval?.contributionScore) {
          projectEvaluationScore += memberEval.contributionScore;
          totalEvaluations++;
        }

        // overall project grading that applies to all team members
        if (evaluation.grading) {
          const categoryScores = [
            evaluation.grading.technicalExecution?.score || 0,
            evaluation.grading.taskValidity?.score || 0,
            evaluation.grading.timeAuthenticity?.score || 0,
            evaluation.grading.teamwork?.score || 0,
            evaluation.grading.documentationQuality?.score || 0
          ];
          
          const avgScore = categoryScores.reduce((sum, score) => sum + score, 0) / 5;
          projectEvaluationScore += avgScore;
          totalEvaluations++;

          // Update breakdown
          evaluationBreakdown.technicalExecution += evaluation.grading.technicalExecution?.score || 0;
          evaluationBreakdown.taskValidity += evaluation.grading.taskValidity?.score || 0;
          evaluationBreakdown.timeAuthenticity += evaluation.grading.timeAuthenticity?.score || 0;
          evaluationBreakdown.teamwork += evaluation.grading.teamwork?.score || 0;
          evaluationBreakdown.documentationQuality += evaluation.grading.documentationQuality?.score || 0;
        }
      });

      if (totalEvaluations > 0) {
        projectEvaluationScore /= totalEvaluations;
        // Normalize to 0-100 scale (since evaluation scores are 0-10)
        projectEvaluationScore = (projectEvaluationScore / 10) * 100;
        
        // Normalize breakdown
        Object.keys(evaluationBreakdown).forEach(key => {
          evaluationBreakdown[key] = (evaluationBreakdown[key] / (projectEvaluations.length * 10)) * 100;
        });
      }
    }

    // Calculate overall productivity score (weighted average)
    // Weights: Task Efficiency (40%), Peer Reviews (30%), Project Evaluations (20%), On-time Rate (10%)
    const taskWeight = 0.4;
    const peerWeight = 0.3;
    const evalWeight = 0.2;
    const timeWeight = 0.1;

    const normalizedPeerScore = (peerReviewScore / 5) * 100; // Convert 1-5 to 0-100
    const normalizedEvalScore = projectEvaluationScore; // Already 0-100
    const normalizedOnTimeRate = onTimeRate; // Already 0-100

    const overallProductivityScore = 
      (overallEfficiency * taskWeight) +
      (normalizedPeerScore * peerWeight) +
      (normalizedEvalScore * evalWeight) +
      (normalizedOnTimeRate * timeWeight);

    // Group by project
    const projectsMap = {};
    
    // Add tasks to projects
    enrichedTasks.forEach(task => {
      const projectId = task.projectId?._id?.toString();
      if (!projectId) return;
      
      if (!projectsMap[projectId]) {
        const project = userProjects.find(p => p._id.toString() === projectId);
        projectsMap[projectId] = {
          projectId: task.projectId._id || task.projectId,
          projectName: task.projectId?.projectName || 'Unknown',
          tasksCompleted: 0,
          totalFocusTime: 0,
          totalEstimatedTime: 0,
          totalEfficiency: 0,
          peerReviews: 0,
          peerReviewScore: 0,
          projectEvaluations: 0,
          projectEvalScore: 0,
          lastContribution: null
        };
      }
      
      if (task.status === 'completed') {
        projectsMap[projectId].tasksCompleted++;
      }
      
      projectsMap[projectId].totalFocusTime += task.totalFocusTime || 0;
      projectsMap[projectId].totalEstimatedTime += task.estimatedTime || 0;
      projectsMap[projectId].totalEfficiency += task.metrics?.efficiency || 0;
      
      const taskDate = task.endDate || task.updatedAt || task.createdAt;
      if (taskDate && (!projectsMap[projectId].lastContribution || 
          new Date(taskDate) > projectsMap[projectId].lastContribution)) {
        projectsMap[projectId].lastContribution = new Date(taskDate);
      }
    });

    // Add peer reviews to projects
    peerReviews.forEach(review => {
      const projectId = review.projectId?.toString();
      if (!projectId || !projectsMap[projectId]) return;
      
      projectsMap[projectId].peerReviews++;
      projectsMap[projectId].peerReviewScore += review.totalScore || 0;
    });

    // Add project evaluations to projects
    projectEvaluations.forEach(evaluation => {
      const projectId = evaluation.projectId?.toString();
      if (!projectId || !projectsMap[projectId]) return;
      
      projectsMap[projectId].projectEvaluations++;
      
      // Calculate evaluation score for this project
      let evalScore = 0;
      const memberEval = evaluation.memberEvaluations?.find(me => 
        me.member?.toString() === userId || me.member?._id?.toString() === userId
      );
      
      if (memberEval?.contributionScore) {
        evalScore += memberEval.contributionScore;
      }
      
      // Add overall project grading
      if (evaluation.grading) {
        const categoryScores = [
          evaluation.grading.technicalExecution?.score || 0,
          evaluation.grading.taskValidity?.score || 0,
          evaluation.grading.timeAuthenticity?.score || 0,
          evaluation.grading.teamwork?.score || 0,
          evaluation.grading.documentationQuality?.score || 0
        ];
        evalScore += categoryScores.reduce((sum, score) => sum + score, 0) / 5;
      }
      
      projectsMap[projectId].projectEvalScore += evalScore;
    });

    // Calculate project contributions
    const projectsContributed = Object.values(projectsMap).map(proj => {
      const avgPeerScore = proj.peerReviews > 0 ? (proj.peerReviewScore / proj.peerReviews) / 5 * 100 : 0;
      const avgEvalScore = proj.projectEvaluations > 0 ? (proj.projectEvalScore / proj.projectEvaluations) / 10 * 100 : 0;
      
      return {
        projectId: proj.projectId,
        projectName: proj.projectName,
        tasksCompleted: proj.tasksCompleted,
        efficiency: proj.tasksCompleted > 0 ? proj.totalEfficiency / proj.tasksCompleted : 0,
        peerReviewScore: avgPeerScore,
        projectEvaluationScore: avgEvalScore,
        overallScore: calculateProjectOverallScore(proj.tasksCompleted, proj.totalEfficiency, avgPeerScore, avgEvalScore),
        lastContribution: proj.lastContribution
      };
    });

    user.productivity = {
      tasksAssigned: enrichedTasks.length,
      tasksCompleted: completedTasks.length,
      totalFocusTime,
      overallEfficiency,
      averageRiskScore,
      onTimeRate,
      
      // Peer review metrics
      peerReviewScore: normalizedPeerScore,
      peerReviewCount: peerReviews.length,
      collaborationScore: (collaborationScore / 5) * 100,
      peerReviewBreakdown,
      
      // Project evaluation metrics
      projectEvaluationScore: normalizedEvalScore,
      projectEvaluationCount: projectEvaluations.length,
      evaluationBreakdown,
      
      // Overall score
      overallProductivityScore: Math.round(overallProductivityScore),
      
      projectsContributed,
      lastUpdated: new Date()
    };

    await user.save();
    return user.productivity;

  } catch (error) {
    console.error('Error updating user productivity:', error);
    return null;
  }
};

// Helper function to calculate project overall score
const calculateProjectOverallScore = (tasksCompleted, efficiency, peerScore, evalScore) => {
  if (tasksCompleted === 0 && peerScore === 0 && evalScore === 0) return 0;
  
  const taskWeight = tasksCompleted > 0 ? 0.4 : 0;
  const peerWeight = peerScore > 0 ? 0.3 : 0;
  const evalWeight = evalScore > 0 ? 0.3 : 0;
  
  const totalWeight = taskWeight + peerWeight + evalWeight;
  
  if (totalWeight === 0) return 0;
  
  return (
    (efficiency * taskWeight) +
    (peerScore * peerWeight) +
    (evalScore * evalWeight)
  ) / totalWeight;
};
export const getUserProductivity = async (req, res) => {
  try {
    const userId = req.userId ||req.user.id;

    // Check authorization
    const user = await User.findById(userId);
    if (!userId && user.role !== 'admin' && user.role !== 'teacher') {
      return res.status(403).json({ 
        success: false, 
        error: "Not authorized to view this user's productivity" 
      });
    }

    const targetUser = await User.findById(userId)
      .select('name username email avatar role skills productivity');
    
    if (!targetUser) {
      return res.status(404).json({ 
        success: false, 
        error: "User not found" 
      });
    }

    await updateUserProductivity(userId);

    const teams = await Team.find({ members: userId }).select('_id name');

    const teamIds = teams.map(team => team._id);

    const userProjects = await Project.find({
      teamId: { $in: teamIds }
    }).select('_id projectName');

    const projectIds = userProjects.map(p => p._id);
    // Get tasks
    const tasks = await Task.find({ assignedTo: userId })
      .populate('projectId', 'projectName')
      .lean();

    // Get peer reviews
    const peerReviews = await PeerReview.find({ 
      reviewee: userId,
    }).populate('reviewer', 'name email avatar');


    // Get project evaluations
    const projectEvaluations = await ProjectEvaluation.find({
      projectId: { $in: projectIds }
    }).populate('evaluator', 'name email role avatar');

    
    // Enrich tasks
    const enrichedTasks = tasks.map(task => enrichTaskWithMetrics(task)).filter(t => t);
    const completedTasks = enrichedTasks.filter(t => t.status === 'completed');

    // Calculate recent performance
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const recentTasks = enrichedTasks.filter(task => 
      task.endDate && 
      new Date(task.endDate) >= thirtyDaysAgo &&
      task.status === 'completed'
    );

    const recentEfficiency = recentTasks.length > 0 
      ? recentTasks.reduce((sum, task) => sum + (task.metrics?.efficiency || 0), 0) / recentTasks.length 
      : 0;

    // Task distribution
    const taskDistribution = {
      completed: completedTasks.length,
      active: enrichedTasks.filter(t => t.status === 'active').length,
      paused: enrichedTasks.filter(t => t.status === 'paused').length,
      notStarted: enrichedTasks.filter(t => t.status === 'not_started').length,
      highRisk: enrichedTasks.filter(t => 
        (t.metrics?.riskScore >= 4 || t.flags?.manualReviewRequired) && 
        t.status !== 'completed'
      ).length
    };

    // Task-based metrics
    const overallEfficiency = enrichedTasks.length > 0 
      ? enrichedTasks.reduce((sum, t) => sum + (t.metrics?.efficiency || 0), 0) / enrichedTasks.length 
      : 0;

    const averageRiskScore = enrichedTasks.length > 0 
      ? enrichedTasks.reduce((sum, t) => sum + (t.metrics?.riskScore || 0), 0) / enrichedTasks.length 
      : 0;

    const onTimeRate = completedTasks.length > 0 
      ? enrichedTasks.filter(t => {
          if (t.status !== 'completed' || !t.endDate || !t.deadline) return false;
          return new Date(t.endDate) <= new Date(t.deadline);
        }).length / completedTasks.length * 100 
      : 0;

    // Peer review metrics
    let peerReviewScore = 0;
    let collaborationScore = 0;
    let peerReviewBreakdown = {
      contribution: 0,
      collaboration: 0,
      quality: 0,
      punctuality: 0
    };

    if (peerReviews.length > 0) {
      peerReviewScore = peerReviews.reduce((sum, r) => sum + (r.totalScore || 0), 0) / peerReviews.length;
      collaborationScore = peerReviews.reduce((sum, r) => sum + (r.scores?.collaboration || 0), 0) / peerReviews.length;
      
      peerReviewBreakdown.contribution = peerReviews.reduce((sum, r) => sum + (r.scores?.contribution || 0), 0) / peerReviews.length;
      peerReviewBreakdown.collaboration = collaborationScore;
      peerReviewBreakdown.quality = peerReviews.reduce((sum, r) => sum + (r.scores?.quality || 0), 0) / peerReviews.length;
      peerReviewBreakdown.punctuality = peerReviews.reduce((sum, r) => sum + (r.scores?.punctuality || 0), 0) / peerReviews.length;
    }

    // Project evaluation metrics
    let projectEvaluationScore = 0;
    let evaluationBreakdown = {
      technicalExecution: 0,
      taskValidity: 0,
      timeAuthenticity: 0,
      teamwork: 0,
      documentationQuality: 0
    };

    if (projectEvaluations.length > 0) {
      let totalScores = 0;
      let totalEvals = 0;
      
      projectEvaluations.forEach(e => {
        const memberEval = e.memberEvaluations?.find(me => 
          me.member?.toString() === userId || me.member?._id?.toString() === userId
        );
        
        if (memberEval?.contributionScore) {
          projectEvaluationScore += memberEval.contributionScore;
          totalScores += memberEval.contributionScore;
          totalEvals++;
        }

        if (e.grading) {
          const categoryScores = [
            e.grading.technicalExecution?.score || 0,
            e.grading.taskValidity?.score || 0,
            e.grading.timeAuthenticity?.score || 0,
            e.grading.teamwork?.score || 0,
            e.grading.documentationQuality?.score || 0
          ];
          
          const avgScore = categoryScores.reduce((sum, s) => sum + s, 0) / 5;
          projectEvaluationScore += avgScore;
          totalScores += avgScore;
          totalEvals++;

          evaluationBreakdown.technicalExecution += e.grading.technicalExecution?.score || 0;
          evaluationBreakdown.taskValidity += e.grading.taskValidity?.score || 0;
          evaluationBreakdown.timeAuthenticity += e.grading.timeAuthenticity?.score || 0;
          evaluationBreakdown.teamwork += e.grading.teamwork?.score || 0;
          evaluationBreakdown.documentationQuality += e.grading.documentationQuality?.score || 0;
        }
      });

      if (totalEvals > 0) {
        projectEvaluationScore = (projectEvaluationScore / totalEvals / 10) * 100;
        
        // Normalize breakdowns
        Object.keys(evaluationBreakdown).forEach(key => {
          evaluationBreakdown[key] = (evaluationBreakdown[key] / (projectEvaluations.length * 10)) * 100;
        });
      }
    }

    // Calculate overall productivity score
    const normalizedPeerScore = (peerReviewScore / 5) * 100;
    const normalizedEvalScore = projectEvaluationScore;
    
    const overallProductivityScore = 
      (overallEfficiency * 0.4) +
      (normalizedPeerScore * 0.3) +
      (normalizedEvalScore * 0.2) +
      (onTimeRate * 0.1);

    // Prepare response
    const response = {
      success: true,
      data: {
        user: {
          _id: targetUser._id,
          name: targetUser.name,
          username: targetUser.username,
          email: targetUser.email,
          avatar: targetUser.avatar,
          role: targetUser.role,
          skills: targetUser.skills || []
        },
        productivity: {
          // Task metrics
          score: Math.round(overallProductivityScore),
          tasksAssigned: enrichedTasks.length,
          tasksCompleted: completedTasks.length,
          totalFocusTime: enrichedTasks.reduce((sum, t) => sum + (t.totalFocusTime || 0), 0),
          averageEfficiency: overallEfficiency,
          averageRiskScore,
          onTimeRate,
          taskDistribution,
          highPriorityAlerts: taskDistribution.highRisk,
          
          // Peer review metrics
          peerReviewScore: Math.round(normalizedPeerScore),
          peerReviewCount: peerReviews.length,
          collaborationScore: Math.round((collaborationScore / 5) * 100),
          peerReviewBreakdown,
          
          // Project evaluation metrics
          projectEvaluationScore: Math.round(normalizedEvalScore),
          projectEvaluationCount: projectEvaluations.length,
          evaluationBreakdown,
          
          // Recent reviews
          recentPeerReviews: peerReviews.slice(0, 3).map(r => ({
            reviewer: r.reviewer?.name || 'Anonymous',
            scores: r.scores,
            totalScore: r.totalScore,
            comment: r.comment,
            submittedAt: r.submittedAt
          }))
        },
        recentPerformance: {
          periodStart: thirtyDaysAgo,
          periodEnd: new Date(),
          tasksCompleted: recentTasks.length,
          averageEfficiency: recentEfficiency,
          totalFocusTime: recentTasks.reduce((sum, t) => sum + (t.totalFocusTime || 0), 0),
          efficiencyTrend: calculateEfficiencyTrend(enrichedTasks)
        }
      }
    };
    res.json(response);
    
  } catch (error) {
    console.error('Error getting user productivity:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
};

const calculateEfficiencyTrend = (tasks) => {
  // Group tasks by week for trend analysis
  const weeklyTrend = {};
  
  tasks.forEach(task => {
    if (task.endDate) {
      const weekStart = new Date(task.endDate);
      weekStart.setDate(weekStart.getDate() - weekStart.getDay());
      weekStart.setHours(0, 0, 0, 0);
      const weekKey = weekStart.toISOString().split('T')[0];
      
      if (!weeklyTrend[weekKey]) {
        weeklyTrend[weekKey] = {
          date: weekStart,
          tasks: 0,
          totalEfficiency: 0
        };
      }
      
      const est = task.estimatedTime || 1;
      const focus = task.totalFocusTime || 0;
      const efficiency = (focus / est) * 100;
      
      weeklyTrend[weekKey].tasks++;
      weeklyTrend[weekKey].totalEfficiency += efficiency;
    }
  });
  
  return Object.values(weeklyTrend)
    .sort((a, b) => a.date - b.date)
    .map(week => ({
      date: week.date,
      efficiency: week.tasks > 0 ? week.totalEfficiency / week.tasks : 0,
      tasksCompleted: week.tasks
    }))
    .slice(-6); // Last 6 weeks
};