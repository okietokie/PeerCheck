import Todo from '../models/toDo.js';
import mongoose from 'mongoose';

// Get all todos for user
export const getTodos = async (req, res) => {
  try {
    const { 
      projectId, 
      completed, 
      priority, 
      category,
      search,
      sortBy = 'dueDate',
      sortOrder = 'asc'
    } = req.query;
    
    const userId = req.user.id;
    
    let query = { user: userId };
    
    //Filter by project
    if (projectId && mongoose.Types.ObjectId.isValid(projectId)) {
      query.project = projectId;
    }
    
    //filter by completion status
    if (completed !== undefined) {
      query.completed = completed === 'true';
    }
    
    // Filter by priority
    if (priority && ['low', 'medium', 'high'].includes(priority)) {
      query.priority = priority;
    }
    
    // Filter by category
    if (category && ['personal', 'work', 'shopping', 'study', 'health', 'other'].includes(category)) {
      query.category = category;
    }
    
    // Search in title and description
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { tags: { $regex: search, $options: 'i' } }
      ];
    }
    
    // Sort options
    let sort = {};
    if (sortBy === 'priority') {
      const priorityOrder = { high: 1, medium: 2, low: 3 };
      sort = { 
        completed: 1,
        $sortBy: { $cond: [ 
          { $eq: ['$priority', 'high'] }, 1, 
          { $cond: [
            { $eq: ['$priority', 'medium'] }, 2, 3 
          ]}
        ]},
        dueDate: sortOrder === 'desc' ? -1 : 1
      };
    } else {
      sort[sortBy] = sortOrder === 'desc' ? -1 : 1;
      sort.completed = 1;
    }
    
    const todos = await Todo.find(query)
      .populate('project', 'name projectName')
      .sort(sort);
    
    res.json({
      success: true,
      count: todos.length,
      todos
    });
  } catch (error) {
    console.error('Error fetching todos:', error);
    res.status(500).json({ 
      success: false,
      error: 'Error fetching todos' 
    });
  }
};

// Create new todo
export const createTodo = async (req, res) => {
  try {
    const { 
      title, 
      description, 
      priority, 
      projectId, 
      dueDate, 
      tags, 
      category 
    } = req.body;
    
    const userId = req.user.id || req.userId ;
    
    // Validate required fields
    if (!title || title.trim() === '') {
      return res.status(400).json({
        success: false,
        error: 'Title is required'
      });
    }
    
    const todo = new Todo({
      title: title.trim(),
      description: description ? description.trim() : '',
      priority: priority || 'medium',
      user: userId,
      project: projectId || null,
      dueDate: dueDate || null,
      tags: tags ? tags.map(tag => tag.trim()) : [],
      category: category || 'personal'
    });
    
    await todo.save();
    
    const populatedTodo = await Todo.findById(todo._id)
      .populate('project', 'name projectName');
    
    res.status(201).json({
      success: true,
      todo: populatedTodo
    });
  } catch (error) {
    console.error('Error creating todo:', error);
    res.status(500).json({ 
      success: false,
      error: 'Error creating todo' 
    });
  }
};

// Update todo
export const updateTodo = async (req, res) => {
  try {
    const { id } = req.params;
    const { 
      title, 
      description, 
      priority, 
      completed, 
      dueDate, 
      tags, 
      category 
    } = req.body;
    
    // Validate todo exists and belongs to user
    const todo = await Todo.findOne({ _id: id, user: req.user.id || req.userId });
    
    if (!todo) {
      return res.status(404).json({ 
        success: false,
        error: 'Todo not found' 
      });
    }
    
    // Update fields
    if (title !== undefined) todo.title = title.trim();
    if (description !== undefined) todo.description = description.trim();
    if (priority !== undefined) todo.priority = priority;
    if (completed !== undefined) todo.completed = completed;
    if (dueDate !== undefined) todo.dueDate = dueDate;
    if (tags !== undefined) todo.tags = tags.map(tag => tag.trim());
    if (category !== undefined) todo.category = category;
    
    todo.updatedAt = Date.now();
    
    await todo.save();
    
    const populatedTodo = await Todo.findById(todo._id)
      .populate('project', 'name projectName');
    
    res.json({
      success: true,
      todo: populatedTodo
    });
  } catch (error) {
    console.error('Error updating todo:', error);
    res.status(500).json({ 
      success: false,
      error: 'Error updating todo' 
    });
  }
};

// Delete todo
export const deleteTodo = async (req, res) => {
  try {
    const { id } = req.params;
    
    const todo = await Todo.findOneAndDelete({ 
      _id: id, 
      user: req.user.id || req.userId
    });
    
    if (!todo) {
      return res.status(404).json({ 
        success: false,
        error: 'Todo not found' 
      });
    }
    
    res.json({
      success: true,
      message: 'Todo deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting todo:', error);
    res.status(500).json({ 
      success: false,
      error: 'Error deleting todo' 
    });
  }
};

// Toggle todo completion
export const toggleTodo = async (req, res) => {
  try {
    const { id } = req.params;
    
    const todo = await Todo.findOne({ _id: id, user: req.user.id || req.userId });
    
    if (!todo) {
      return res.status(404).json({ 
        success: false,
        error: 'Todo not found' 
      });
    }
    
    todo.completed = !todo.completed;
    todo.updatedAt = Date.now();
    await todo.save();
    
    const populatedTodo = await Todo.findById(todo._id)
      .populate('project', 'name projectName');
    
    res.json({
      success: true,
      todo: populatedTodo
    });
  } catch (error) {
    console.error('Error toggling todo:', error);
    res.status(500).json({ 
      success: false,
      error: 'Error toggling todo' 
    });
  }
};

// Get todo statistics
export const getTodoStats = async (req, res) => {
  try {
    const userId = req.user.id || req.userId ;
    
    const stats = await Todo.aggregate([
      { $match: { user: new mongoose.Types.ObjectId(userId) } },
      {
        $group: {
          _id: null,
          total: { $sum: 1 },
          completed: { 
            $sum: { $cond: [{ $eq: ['$completed', true] }, 1, 0] } 
          },
          highPriority: { 
            $sum: { $cond: [{ $eq: ['$priority', 'high'] }, 1, 0] } 
          },
          mediumPriority: { 
            $sum: { $cond: [{ $eq: ['$priority', 'medium'] }, 1, 0] } 
          },
          lowPriority: { 
            $sum: { $cond: [{ $eq: ['$priority', 'low'] }, 1, 0] } 
          },
          overdue: {
            $sum: {
              $cond: [
                {
                  $and: [
                    { $ne: ['$dueDate', null] },
                    { $lt: ['$dueDate', new Date()] },
                    { $eq: ['$completed', false] }
                  ]
                },
                1,
                0
              ]
            }
          }
        }
      }
    ]);
    
    const result = stats[0] || { 
      total: 0, 
      completed: 0, 
      highPriority: 0, 
      mediumPriority: 0, 
      lowPriority: 0,
      overdue: 0
    };
    
    result.pending = result.total - result.completed;
    result.completionRate = result.total > 0 
      ? Math.round((result.completed / result.total) * 100) 
      : 0;
    
    // Get category distribution
    const categoryStats = await Todo.aggregate([
      { $match: { user: new mongoose.Types.ObjectId(userId) } },
      {
        $group: {
          _id: '$category',
          count: { $sum: 1 },
          completed: {
            $sum: { $cond: [{ $eq: ['$completed', true] }, 1, 0] }
          }
        }
      }
    ]);
    
    result.categories = categoryStats;
    
    res.json({
      success: true,
      stats: result
    });
  } catch (error) {
    console.error('Error fetching todo stats:', error);
    res.status(500).json({ 
      success: false,
      error: 'Error fetching todo statistics' 
    });
  }
};

// Bulk update todos
export const bulkUpdateTodos = async (req, res) => {
  try {
    const { todoIds, updates } = req.body;
    const userId = req.user.id || req.userId ;
    
    if (!todoIds || !Array.isArray(todoIds) || todoIds.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'No todos specified for update'
      });
    }
    
    // Validate all todos belong to user
    const userTodos = await Todo.find({
      _id: { $in: todoIds },
      user: userId
    });
    
    if (userTodos.length !== todoIds.length) {
      return res.status(403).json({
        success: false,
        error: 'Some todos not found or not authorized'
      });
    }
    
    // Update all todos
    const updateResult = await Todo.updateMany(
      { _id: { $in: todoIds }, user: userId },
      { ...updates, updatedAt: Date.now() },
      { runValidators: true }
    );
    
    res.json({
      success: true,
      message: `${updateResult.modifiedCount} todos updated successfully`
    });
  } catch (error) {
    console.error('Error in bulk update:', error);
    res.status(500).json({
      success: false,
      error: 'Error updating todos'
    });
  }
};

// Quick add todo
export const quickAddTodo = async (req, res) => {
  try {
    const { title, priority = 'medium' } = req.body;
    const userId = req.user._id;
    
    if (!title || title.trim() === '') {
      return res.status(400).json({
        success: false,
        error: 'Title is required'
      });
    }
    
    const todo = new Todo({
      title: title.trim(),
      priority,
      user: userId,
    });
    
    await todo.save();
    
    res.status(201).json({
      success: true,
      todo
    });
  } catch (error) {
    console.error('Error quick adding todo:', error);
    res.status(500).json({ 
      success: false,
      error: 'Error adding todo' 
    });
  }
};