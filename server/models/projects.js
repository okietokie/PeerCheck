import mongoose from 'mongoose';

const projectSchema = new mongoose.Schema({
  projectName: { type: String, required: true, trim: true },
  description: { type: String, required: true, trim: true },
  startDate: { type: Date, required: true },
  endDate: { type: Date, default: null },
  deadline: { type: Date, required: true},
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  status: { type: String, enum: ['not_started', 'ongoing', 'completed', 'on_hold'], default: 'not_started' },
  tags: [{ type: String, trim: true }],
  teamId: { type: mongoose.Schema.Types.ObjectId, ref: "Team", required: true },
  teamName: { type: String, trim: true },
  milestones: [{ title: String }],
  progress: { type: Number, min: 0, max: 100, default: 0 },
  metrics: { type: Object, default: () => ({
    peerReviewPerMember: [], progress: { completedTasks: 0, progress: 0, statusBreakdown: { not_started: 0, active: 0, paused: 0, completed: 0 }, totalTasks: 0 },
    freeRiders: [], freeRidersCheckedAt: {type: Date}, timeEfficiency: { label: 'Low', projectEfficiency: 0, status: 'low', totalEstimatedTime: 0, totalFocusTime: 0 },
    projectRisk: { averageRiskScore: 0, highRiskTasks: 0, mediumRiskTasks: 0, riskyTasks: 0, totalTasks: 0, projectRiskScore: 0, riskLabel: 'Low Risk', riskLevel: 'low' },
    proofCompliance: { complianceRate: 0, tasksWithProof: 0, totalTasks: 0 }, deadlineHealth: { overdueRate: 0, overdueTasks: 0, upcomingDeadlines: 0, totalTasks: 0 },
    health: { componentScores: { deadlineAdjusted: 0, progress: 0, proofCompliance: 0, riskAdjusted: 0 }, healthScore: 0, healthLabel: 'Healthy', healthLevel: 'healthy' },
    contributorFairness: { contributors: {}, teamMemberCount: 0, freeRiderRisk: false }
  })},
  gradingCriteria: { taskCompletionWeight: { type: Number, default: 40 }, peerReviewWeight: { type: Number, default: 30 }, teacherReviewWeight: { type: Number, default: 30 }, allowPeerReview: { type: Boolean, default: true } },
  toolkit: [{ type: String }]
}, { timestamps: true });

const Project = mongoose.model("Project", projectSchema);
export default Project;