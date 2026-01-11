import mongoose from "mongoose";

const projectEvaluationSchema = new mongoose.Schema(
  {
    projectId: { type: mongoose.Schema.Types.ObjectId, ref: "Project", required: true },

    evaluatedTeam: { type:String, required: true },

    evaluator: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true},

    evaluatorRole: { type: String, enum: ["teacher", "student"], required: true},

    grading: { 
      technicalExecution: {  //Measures how well the project was executed technically
        score: { type: Number, min: 0, max: 10 },
        comment: String
      },
      taskValidity: {  //Checks if tasks actually match the project objectives.
        score: { type: Number, min: 0, max: 10 },
        comment: String
      },
      timeAuthenticity: {  //Measures whether the time spent on tasks is realistic.
        score: { type: Number, min: 0, max: 10 },
        comment: String
      },
      teamwork: {  //Evaluates collaboration and contribution to the team.
        score: { type: Number, min: 0, max: 10 },
        comment: String
      },
      documentationQuality: {  //Measures clarity and completeness of documentation.
        score: { type: Number, min: 0, max: 10 },
        comment: String
      }
    },

    memberEvaluations: [  //Peer evaluated
      {
        member: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User"
        },
        contributionScore: {
          type: Number,
          min: 0,
          max: 10
        },
      }
    ],
    allowPeerReview: { type: Boolean, default: true },

    suspicionFlags: {  //Auto/manual flags for detecting fake work
      paddedTasksDetected: { type: Boolean, default: false },
      unrealisticTimeLogs: { type: Boolean, default: false },
      copyPasteWork: { type: Boolean, default: false },
      comment: String
    },


    finalScore: { //Aggregated score across all grading parameters + peer/teacher weighting
      type: Number,
      min: 0,
      max: 50
      // calculated server-side
    },

    submittedAt: {
      type: Date,
      default: Date.now
    }
  },
  { timestamps: true }
);

const ProjectEvaluation = mongoose.model("ProjectEvaluation", projectEvaluationSchema);

export default ProjectEvaluation;
