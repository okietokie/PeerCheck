import Project from "../models/projects.js";
import DeletedProjects from "../models/deletedProjectInfo.js";

export const createProject = async (req, res) => {
    try {
        const { projectName, description, startDate, endDate } = req.body;
    
        // Basic validation
        if (!projectName || !description || !startDate || !endDate) {
        return res.status(400).json({ error: "Missing required fields" });
        }
        
        // Create project with creator ID from authenticated user
        const projectData = {
        ...req.body,
        createdBy: req.user.id // Assuming you have user authentication
        };
        
        const newProject = new Project(projectData);
        await newProject.save();
    
        res.status(201).json(newProject);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

export const deleteProject = async (req, res) =>{
    try {
        const { projectId } = req.params;
            
        const project = await Project.findById(projectId);
        
        // If project exists
        if (!project) {
        return res.status(404).json({ error: "Project not found" });
        }

        //if user trying to delete is neither the project creator nor the admin
        const isCreator = project.createdBy.toString() === req.user.id;
        const isAdmin = req.user.role === 'admin';
        
        if (!isCreator && !isAdmin) {
            return res.status(403).json({ error: "Not authorized to delete this project" });
        }
        const newProject = new DeletedProjects(project);
        await newProject.save();

        await Project.findByIdAndDelete(projectId);
        res.status(200).json({ message: "Project deleted successfully" });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

export const getAllProjects = async (req, res) => {
    try {
        const projects = await Project.find()
          .populate("team", 'name email')
          .populate("createdBy", 'name email');
        res.json(projects);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

export const getProjectById = async (req, res) => {
  try {
    const { projectId } = req.params;
    
    const project = await Project.findById(projectId)
      .populate('createdBy', 'name email')
      .populate('team', 'name email');
    
    if (!project) {
      return res.status(404).json({ error: "Project not found" });
    }
    
    res.json(project);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

export const searchProjects = async (req, res) => {
  try {
    const { query } = req.query;
    
    if (!query || query.trim() === '') {
      return res.status(400).json({ error: "Search query is required" });
    }
    
    const projects = await Project.find({
      $and: [
        {
          $or: [
            { projectName: { $regex: query, $options: 'i' } },
            { description: { $regex: query, $options: 'i' } },
            { tags: { $regex: query, $options: 'i' } }
          ]
        }
      ]
    })
      .populate('createdBy', 'name email')
      .populate('team', 'name email')
      .limit(20);
    
    res.json(projects);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}