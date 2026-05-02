import Project from '../models/projects.js';
import MentorProjectAssignment from "../models/mentorProjectAssignment.js";
import User from "../models/user.js";
import Team from "../models/peergroup_log.js";
import ProjectEvaluation from '../models/projectEvaluation.js';

export const getMentors = async (req,res) => {
    try {
    
        const mentors = await User.find({ role: 'teacher' }).select('_id name email');
        res.status(200).json({ mentors });
    } catch (error) {
        console.error("Error fetching mentors:", error);
        res.status(500).json({ message: "Server error fetching mentors." });
    }
};

export const getMentorById = async (req, res) => {
    try {
        const projectId = req.params.projectId;


        const mentor = await MentorProjectAssignment.findOne({ project: projectId })
            .populate('mentor', '_id name email avatar')
            .select('mentor');

        if (!mentor) {
            const project = await Project.findById(projectId).populate('createdBy', '_id name email avatar');
            if (!project) {
                return res.status(404).json({ message: "Project not found." });
            }

            return res.status(200).json({
                mentor: project.createdBy,
                isDefaultLeaderMentor: true,
                message: "No teacher assigned. Project creator is the default mentor."
            });
        }

        
        res.status(200).json({ mentor, isDefaultLeaderMentor: false });
    } catch (error) {
        console.error("Error fetching mentor:", error);
        res.status(500).json({ message: "Server error fetching mentor." });
    }
};

export const assignMentorToProject = async (req, res) => {
    const { mentorId, projectId } = req.body;
    try {

      const existingAssignment = await MentorProjectAssignment.findOne({ mentor: mentorId, project: projectId });
        if (existingAssignment) {
            return res.status(400).json({ message: "Mentor is already assigned to this project." });
        }
        const newAssignment = new MentorProjectAssignment({
            mentor: mentorId,
            project: projectId 
        });
        await newAssignment.save();
        res.status(201).json({ message: "Mentor assigned to project successfully.", assignment: newAssignment });
    } catch (error) {
        console.error("Error assigning mentor to project:", error);
        res.status(500).json({ message: "Server error assigning mentor to project." });
    }
};

export const removeMentorFromProject = async (req, res) => {
    const { assignmentId } = req.params;
    try {
        const deletedAssignment = await MentorProjectAssignment.findByIdAndDelete(assignmentId);
        if (!deletedAssignment) {
            return res.status(404).json({ message: "Assignment not found." });
        }
        res.status(200).json({ message: "Mentor removed from project successfully." });
    } catch (error) {
        console.error("Error removing mentor from project:", error);
        res.status(500).json({ message: "Server error removing mentor from project." });
    }   
};

export const fetchProjectsMonitoredByMentor = async (req, res) => {
    try {
        const userId = req.user.id || req.userId;

        const isMentor = await User.findOne({_id: userId, role: "teacher"}) 

        if(!isMentor){
            return res.status(403).json({message: `Error unauthorized to access data`});
        }

        const projectIds = await MentorProjectAssignment
        .find({ mentor: userId })
        .distinct("project");
      
        const projects = await Project.find(
            { _id: { $in: projectIds } },
        )
            .populate("teamId", "name");
      
        

        return res.status(200).json({
            success: true,
            projects: projects
        })
        
    } catch (error) {
        console.error("Error fetching projects: ", error);
        res.status(500).json({ message: "Server error fetching projects." });
    }
}
export const fetchTeamsMonitoredByMentor = async (req, res) => {
    try {
        const userId = req.user.id || req.userId;
        const isMentor = await User.findOne({_id: userId, role: "teacher"}) 

        if(!isMentor){
            return res.status(403).json({message: `Error unauthorized to access data`});
        }
        
        const projectIds = await MentorProjectAssignment
        .find({ mentor: userId })
        .distinct("project");
      
      const projects = await Project.find(
        { _id: { $in: projectIds } },
        { teamId: 1 }
      );
      
      const teamIds = projects.map(p => p.teamId);
      
      const teams = await Team.find({ _id: { $in: teamIds } })
                    .populate("members", "name username email avatar")
                    .populate("projects", "projectName");

      console.log("teams", teams)
        return res.status(200).json({
            success: true,
            teams: teams
        })

    } catch (error) {
        console.error("Error fetching teams: ", error);
        res.status(500).json({ message: "Server error fetching teams." });
    }
}

export const getTeacherDashboard = async (req, res) => {
  try {
    const teacherId = req.user.id;

    // Get all projects assigned to this teacher
    const mentorProjects = await MentorProject.find({ mentor: teacherId })
      .select("project");

    const projectIds = mentorProjects.map(mp => mp.project);

    if (projectIds.length === 0) {
      return res.json({
        success: true,
        dashboard: {
          totalProjects: 0,
          activeProjects: 0,
          completedProjects: 0,
          projectsNeedingAttention: 0,
          avgHealthScore: 0,
          totalFreeRiders: 0,
          overdueTasks: 0
        }
      });
    }

    // Fetch projects
    const projects = await Project.find({ _id: { $in: projectIds } });

    let activeProjects = 0;
    let completedProjects = 0;
    let healthScoreSum = 0;
    let healthScoreCount = 0;
    let projectsNeedingAttention = 0;
    let totalFreeRiders = 0;

    projects.forEach(project => {
      // Status
      if (project.status === "completed") {
        completedProjects++;
      } else {
        activeProjects++;
      }

      // Health score
      if (project.health?.healthScore !== undefined) {
        healthScoreSum += project.health.healthScore;
        healthScoreCount++;
      }

      // attention logic
      if (
        project.health?.healthLevel === "warning" ||
        project.health?.healthLevel === "critical" ||
        project.contributorFairness?.freeRiderRisk === true
      ) {
        projectsNeedingAttention++;
      }

      // Free riders
      if (Array.isArray(project.freeRiders)) {
        totalFreeRiders += project.freeRiders.length;
      }
    });

    const avgHealthScore =
      healthScoreCount > 0
        ? Number((healthScoreSum / healthScoreCount).toFixed(2))
        : 0;

    // Count overdue tasks across all projects
    const overdueTasks = await Task.countDocuments({
      projectId: { $in: projectIds },
      deadline: { $lt: new Date() },
      status: { $ne: "completed" }
    });

    // Final response
    res.json({
      success: true,
      dashboard: {
        totalProjects: projects.length,
        activeProjects,
        completedProjects,
        projectsNeedingAttention,
        avgHealthScore,
        totalFreeRiders,
        overdueTasks
      }
    });

  } catch (error) {
    console.error("Teacher dashboard error:", error);
    res.status(500).json({
      success: false,
      error: "Failed to load teacher dashboard"
    });
  }
};



// Submit teacher evaluation
export const submitTeacherEvaluation = async (req, res) => {
  try {
    const teacherId = req.user.id;
    const { projectId } = req.params;
    const { grading, memberEvaluations } = req.body;

    // Validate
    if (!grading) return res.status(400).json({ success: false, error: "Grading required" });

    // Check project exists
    const project = await Project.findById(projectId);
    if (!project) return res.status(404).json({ success: false, error: "Project not found" });

    // Check if teacher has already evaluated
    let evaluation = await ProjectEvaluation.findOne({ projectId, evaluator: teacherId });
    if (!evaluation) {
      evaluation = new ProjectEvaluation({
        projectId,
        evaluator: teacherId,
        evaluatorRole: 'teacher',
        grading,
        memberEvaluations: memberEvaluations || []
      });
    } else {
      evaluation.grading = grading;
      evaluation.memberEvaluations = memberEvaluations || [];
    }

    // Calculate final score
    const scores = Object.values(grading).map(c => c.score || 0);
    evaluation.finalScore = scores.reduce((a, b) => a + b, 0);

    await evaluation.save();

    res.status(201).json({ success: true, message: "Evaluation submitted", evaluation });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: err.message });
  }
};

export const getTeacherAnalytics = async (req, res) => {
  try {
    const { projectId, teamId, memberId } = req.query;

    // Projects metrics
    let projectsQuery = {};
    if (projectId) projectsQuery._id = projectId;
    if (teamId) projectsQuery.teamId = teamId;

    const projects = await Project.find(projectsQuery)
      .populate('teamId', 'name members')
      .lean();

    const totalProjects = projects.length;
    const completedProjects = projects.filter(p => p.status === 'Completed').length;
    const ongoingProjects = totalProjects - completedProjects;

    // Average scores per project
    const averageScoreByProject = [];
    for (const project of projects) {
      const evaluations = await ProjectEvaluation.find({ projectId: project._id });
      let totalScore = 0;
      let count = 0;
      evaluations.forEach(ev => {
        if (ev.finalScore != null) {
          totalScore += ev.finalScore;
          count++;
        }
      });
      averageScoreByProject.push({
        projectId: project._id,
        projectName: project.projectName,
        averageScore: count ? (totalScore / count).toFixed(2) : 0
      });
    }

    // Free rider detection
    const freeRiders = [];
    projects.forEach(p => {
      (p.freeRiders || []).forEach(fr => {
        freeRiders.push({ memberId: fr.userId, name: fr.name, reason: fr.reason });
      });
    });

    // Member contributions
    let memberContributions = [];
    const allEvaluations = await ProjectEvaluation.find()
      .populate('memberEvaluations.member', 'name email');

    const memberMap = {};
    allEvaluations.forEach(ev => {
      ev.memberEvaluations.forEach(me => {
        const id = me.member._id.toString();
        if (!memberMap[id]) memberMap[id] = { name: me.member.name, totalScore: 0, totalEvaluations: 0 };
        memberMap[id].totalScore += me.contributionScore || 0;
        memberMap[id].totalEvaluations++;
      });
    });
    memberContributions = Object.entries(memberMap).map(([id, data]) => ({
      memberId: id,
      name: data.name,
      averageScore: (data.totalScore / data.totalEvaluations).toFixed(2),
      totalEvaluations: data.totalEvaluations
    }));

    // Project health and risk metrics
    const projectHealth = projects.map(p => ({
      projectId: p._id,
      healthScore: p.contributorFairness?.healthScore || 0,
      healthLevel: p.contributorFairness?.healthLevel || 'unknown',
    }));

    const riskMetrics = projects.map(p => ({
      projectId: p._id,
      riskLevel: p.projectRisk?.riskLevel || 'low',
      riskyTasks: p.projectRisk?.riskyTasks || 0
    }));

    res.json({
      success: true,
      totalProjects,
      completedProjects,
      ongoingProjects,
      averageScoreByProject,
      memberContributions,
      freeRiders,
      projectHealth,
      riskMetrics
    });

  } catch (err) {
    console.error('Teacher Analytics Error:', err);
    res.status(500).json({ success: false, error: err.message });
  }
};
export const updateEvaluation = async (req, res) => {
  try {
    const { evaluationId } = req.params;
    const { grading, memberEvaluations, teacherFeedback } = req.body;

    const evaluation = await ProjectEvaluation.findById(evaluationId);
    if (!evaluation) return res.status(404).json({ success: false, error: "Evaluation not found" });

    // Update grading categories
    if (grading) {
      Object.keys(grading).forEach(key => {
        if (evaluation.grading[key]) {
          if (grading[key].score !== undefined) evaluation.grading[key].score = grading[key].score;
          if (grading[key].comment !== undefined) evaluation.grading[key].comment = grading[key].comment;
        }
      });
    }

    // Update member evaluations
    if (memberEvaluations) {
      evaluation.memberEvaluations = memberEvaluations.map(me => ({
        member: me.member,
        contributionScore: me.contributionScore || 0,
        comment: me.comment || ''
      }));
    }

    // Update teacher feedback
    if (teacherFeedback !== undefined) evaluation.teacherFeedback = teacherFeedback;

    // Recalculate finalScore
    evaluation.finalScore = Object.values(evaluation.grading).reduce(
      (sum, cat) => sum + (cat.score || 0),
      0
    );

    await evaluation.save();

    res.json({ success: true, message: "Evaluation updated successfully", evaluation });

  } catch (err) {
    console.error('Update Evaluation Error:', err);
    res.status(500).json({ success: false, error: err.message });
  }
};

export const deleteEvaluation = async (req, res) => {
  try {
    const { evaluationId } = req.params;

    const evaluation = await ProjectEvaluation.findByIdAndDelete(evaluationId);
    if (!evaluation) return res.status(404).json({ success: false, error: "Evaluation not found" });
    res.json({ success: true, message: "Evaluation deleted successfully" });

  } catch (err) {
    console.error('Delete Evaluation Error:', err);
    res.status(500).json({ success: false, error: err.message });
  }
};


