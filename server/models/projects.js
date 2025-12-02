import mongoose from 'mongoose';

const projectSchema = new mongoose.Schema(
  {
    projectName: { type: String, required: true, trim: true},
    description: { type: String, required: true, trim: true},
    startDate: { type: Date, required: true},
    endDate: { type: Date, required: true},
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true} ,
    status: { type: String, enum: ['not_started', 'ongoing', 'completed', 'on_hold'], default: 'not_started'},
    tags: [ { type:String, trim: true } ],
    team: [{ 
      type: mongoose.Schema.Types.ObjectId, 
      ref: 'User' 
    }],
    teamName:{ type: String, trim: true},
    milestones: [{ title: String }],
    progress: { 
      type: Number, 
      min: 0, 
      max: 100, 
      default: 0 
    },
    
    // ADD THIS METRICS SECTION
    metrics: {
      lastCalculated: { type: Date },
      weightedProgress: { type: Number, default: 0 },
      timeEfficiency: { type: Number, default: 0 },
      projectRiskScore: { type: Number, default: 0 },
      proofCompliance: { type: Number, default: 0 },
      overdueRate: { type: Number, default: 0 },
      healthScore: { type: Number, default: 0 },
      
      statusBreakdown: {
        not_started: { type: Number, default: 0 },
        active: { type: Number, default: 0 },
        paused: { type: Number, default: 0 },
        completed: { type: Number, default: 0 }
      },
      
      efficiencyStatus: { type: String, enum: ['low', 'warning', 'good', 'high'], default: 'good' },
      riskLevel: { type: String, enum: ['low', 'medium', 'high'], default: 'low' },
      healthLevel: { type: String, enum: ['critical', 'warning', 'good', 'excellent', 'healthy'], default: 'healthy' }
    },
    
    gradingCriteria: {
      taskCompletionWeight: { type: Number, default: 40 },
      peerReviewWeight: { type: Number, default: 30 },
      teacherReviewWeight: { type: Number, default: 30 },
      allowPeerReview: { type: Boolean, default: true }
    }
  },
  { timestamps: true }
);

const Project = mongoose.model("Project", projectSchema);
export default Project;