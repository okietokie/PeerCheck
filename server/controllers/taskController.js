import Task from "../models/tasks.js";
import Project from "../models/projects.js";

export const getTasks = async (req, res) => {
    try {
        const { projectId } = req.params;
        
        const tasks = await Task.find({ project: projectId })
            .populate('assignedTo.user', 'username name')
            .sort({ dueDate: 1 });

        res.status(200).json({ tasks });
    } catch (err) {
        res.status(500).json({ message: "Error fetching tasks from server!" });
    }
};

export const createTask = async (req, res) => {
    try {
        const { title, description, project, dueDate, priority } = req.body;

        // Validate required fields
        if (!title || !project || !dueDate) {
            return res.status(400).json({ message: 'Title, project, and due date are required' });
        }

        // Check if project exists
        const projectExists = await Project.findById(project);
        if (!projectExists) {
            return res.status(404).json({ message: 'Project not found' });
        }

        const task = new Task({
            title,
            description,
            project,
            dueDate: new Date(dueDate),
            priority: priority || 'medium',
            assignedTo: [] // You can add user assignment logic here
        });

        await task.save();
        res.status(201).json({ message: "Task created successfully", task });

    } catch (err) {
        res.status(500).json({ message: `Error creating task: ${err.message}` });
    }
};

export const updateTaskStatus = async (req, res) => {
    try {
        const { taskId } = req.params;
        const { status } = req.body;

        const task = await Task.findByIdAndUpdate(
            taskId,
            { status },
            { new: true }
        );

        if (!task) {
            return res.status(404).json({ message: "Task not found" });
        }

        res.status(200).json({ message: "Task status updated successfully", task });
    } catch (err) {
        res.status(500).json({ message: `Error updating task: ${err.message}` });
    }
};

export const deleteTask = async (req, res) => {
    try {
        const { taskId } = req.params;
        
        const task = await Task.findByIdAndDelete(taskId);
        if (!task) {
            return res.status(404).json({ message: "Task not found" });
        }

        res.status(200).json({ message: "Task deleted successfully" });
    } catch (err) {
        res.status(500).json({ message: `Error deleting task: ${err.message}` });
    }
};