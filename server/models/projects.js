import mongoose from 'mongoose';

const projectSchema = new mongoose.Schema(
  {
    projectName: { type: String, required: true, trim: true },
    description: { type: String, required: true, trim: true },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },

    status: {
      type: String,
      enum: ['not_started', 'ongoing', 'completed', 'on_hold'],
      default: 'not_started'
    },

    tags: [{ type: String, trim: true }],

    teamId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Team",
      required: true
    },

    teamName: { type: String, trim: true },

    milestones: [{ title: String }],

    progress: {
      type: Number,
      min: 0,
      max: 100,
      default: 0
    },


    metrics: {
      timestamp: { type: Date },

      progress: {
        completedTasks: { type: Number, default: 0 },
        progress: { type: Number, default: 0 },
        statusBreakdown: {
          not_started: { type: Number, default: 0 },
          active: { type: Number, default: 0 },
          paused: { type: Number, default: 0 },
          completed: { type: Number, default: 0 }
        },
        totalTasks: { type: Number, default: 0 }
      },

      timeEfficiency: {
        label: { type: String },
        projectEfficiency: { type: Number, default: 0 },
        status: {
          type: String,
          enum: ['low', 'warning', 'good', 'high'],
          default: 'low'
        },
        totalEstimatedTime: { type: Number, default: 0 },
        totalFocusTime: { type: Number, default: 0 }
      },

      projectRisk: {
        averageRiskScore: { type: Number, default: 0 },
        highRiskTasks: { type: Number, default: 0 },
        mediumRiskTasks: { type: Number, default: 0 },
        riskyTasks: { type: Number, default: 0 },
        totalTasks: { type: Number, default: 0 },
        projectRiskScore: { type: Number, default: 0 },
        riskLabel: { type: String },
        riskLevel: {
          type: String,
          enum: ['low', 'medium', 'high'],
          default: 'low'
        }
      },

      proofCompliance: {
        complianceRate: { type: Number, default: 0 },
        tasksWithProof: { type: Number, default: 0 },
        totalTasks: { type: Number, default: 0 }
      },

      deadlineHealth: {
        overdueRate: { type: Number, default: 0 },
        overdueTasks: { type: Number, default: 0 },
        upcomingDeadlines: { type: Number, default: 0 },
        totalTasks: { type: Number, default: 0 }
      },

      health: {
        componentScores: {
          deadlineAdjusted: { type: Number, default: 0 },
          progress: { type: Number, default: 0 },
          proofCompliance: { type: Number, default: 0 },
          riskAdjusted: { type: Number, default: 0 }
        },
        healthScore: { type: Number, default: 0 },
        healthLabel: { type: String },
        healthLevel: {
          type: String,
          enum: ['critical', 'warning', 'good', 'excellent', 'healthy'],
          default: 'healthy'
        }
      },

      contributorFairness: {
        contributors: {
          type: Map,
          of: new mongoose.Schema(
            {
              assignedTasks: { type: Number, default: 0 },
              completedTasks: { type: Number, default: 0 },
              assignedPercentage: { type: Number, default: 0 },
              completedPercentage: { type: Number, default: 0 },
              isFreeRider: { type: Boolean, default: false }
            },
            { _id: false }
          )
        },
        teamMemberCount: { type: Number, default: 0 },
        freeRiderRisk: { type: Boolean, default: false }
      }
    },

    gradingCriteria: {
      taskCompletionWeight: { type: Number, default: 40 },
      peerReviewWeight: { type: Number, default: 30 },
      teacherReviewWeight: { type: Number, default: 30 },
      allowPeerReview: { type: Boolean, default: true }
    },

    toolkit: [{ type: String }]
  },
  { timestamps: true }
);

const Project = mongoose.model("Project", projectSchema);
export default Project;
