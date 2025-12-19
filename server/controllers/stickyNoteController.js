import  StickyNote from '../models/stickyNote.js';
import Project from '../models/projects.js';

// Create a new sticky note
export const createStickyNote = async (req, res) => {
  try {
    const { projectId } = req.params;
    const { title, description, color, assignedUser, category, isImportant, isPinned } = req.body;
    
    // Verify project exists and user has access
    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found'
      });
    }
    
    // Check if user is a member of the project
    const isMember = project.teamId?.members?.some(member => 
      member._id.toString() === req.user.id
    );
    const isCreator = project.createdBy.toString() === req.user.id;
    
    if (!isMember && !isCreator) {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to add notes to this project'
      });
    }
    
    // Create the sticky note
    const stickyNote = await StickyNote.create({
      projectId,
      title,
      description,
      color: color || '#FEF9E7',
      assignedUser: assignedUser || req.user.id,
      createdBy: req.user.id,
      category: category || 'thought',
      isImportant: isImportant || false,
      isPinned: isPinned || false
    });
    
    // Populate user info
    await stickyNote.populate([
      { path: 'author', select: '_id name email avatar role' },
      { path: 'assignedUserInfo', select: '_id name email avatar role' }
    ]);
    
    res.status(201).json({
      success: true,
      message: 'Sticky note created successfully',
      data: stickyNote
    });
  } catch (error) {
    console.error('Error creating sticky note:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// Get all sticky notes for a project
export const getStickyNotes = async (req, res) => {
  try {
    const { projectId } = req.params;
    const { category, assignedUser, pinnedOnly } = req.query;
    
    // Build query
    const query = { projectId };
    
    // Apply filters if provided
    if (category && category !== 'all') {
      query.category = category;
    }
    
    if (assignedUser && assignedUser !== 'all') {
      query.assignedUser = assignedUser;
    }
    
    if (pinnedOnly === 'true') {
      query.isPinned = true;
    }
    
    // Get sticky notes with populated user info
    const stickyNotes = await StickyNote.find(query)
      .populate('author', '_id name email avatar role')
      .populate('assignedUserInfo', '_id name email avatar role')
      .sort({ isPinned: -1, order: 1, createdAt: -1 })
      .lean();
    
    // Transform the data to match frontend format
    const formattedNotes = stickyNotes.map(note => ({
      id: note._id,
      title: note.title,
      content: note.description,
      color: note.color,
      author: note.author,
      assignedUser: note.assignedUserInfo,
      timestamp: note.createdAt,
      isPinned: note.isPinned,
      isImportant: note.isImportant,
      category: note.category,
      position: note.position,
      order: note.order
    }));
    
    res.json({
      success: true,
      message: 'Sticky notes retrieved successfully',
      data: formattedNotes,
      count: formattedNotes.length
    });
  } catch (error) {
    console.error('Error fetching sticky notes:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// Update a sticky note
export const updateStickyNote = async (req, res) => {
  try {
    const { noteId } = req.params;
    const updateData = req.body;
    
    // Find the note
    const stickyNote = await StickyNote.findById(noteId);
    
    if (!stickyNote) {
      return res.status(404).json({
        success: false,
        message: 'Sticky note not found'
      });
    }
    
    // Check permissions - only creator or assigned user can edit
    const isCreator = stickyNote.createdBy.toString() === req.user.id;
    const isAssigned = stickyNote.assignedUser.toString() === req.user.id;
    
    if (!isCreator && !isAssigned) {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to edit this note'
      });
    }
    
    // Update fields
    const allowedUpdates = ['title', 'description', 'color', 'assignedUser', 'category', 'isImportant'];
    allowedUpdates.forEach(field => {
      if (updateData[field] !== undefined) {
        stickyNote[field] = updateData[field];
      }
    });
    
    await stickyNote.save();
    
    // Populate updated info
    await stickyNote.populate([
      { path: 'author', select: '_id name email avatar role' },
      { path: 'assignedUserInfo', select: '_id name email avatar role' }
    ]);
    
    res.json({
      success: true,
      message: 'Sticky note updated successfully',
      data: {
        id: stickyNote._id,
        title: stickyNote.title,
        content: stickyNote.description,
        color: stickyNote.color,
        author: stickyNote.author,
        assignedUser: stickyNote.assignedUserInfo,
        timestamp: stickyNote.createdAt,
        isPinned: stickyNote.isPinned,
        isImportant: stickyNote.isImportant,
        category: stickyNote.category
      }
    });
  } catch (error) {
    console.error('Error updating sticky note:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// Delete a sticky note
export const deleteStickyNote = async (req, res) => {
  try {
    const { noteId } = req.params;
    
    const stickyNote = await StickyNote.findById(noteId);
    
    if (!stickyNote) {
      return res.status(404).json({
        success: false,
        message: 'Sticky note not found'
      });
    }
    
    // Check permissions - only creator or assigned user can delete
    const isCreator = stickyNote.createdBy.toString() === req.user.id;
    const isAssigned = stickyNote.assignedUser.toString() === req.user.id;
    
    if (!isCreator && !isAssigned) {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to delete this note'
      });
    }
    
    await stickyNote.deleteOne();
    
    res.json({
      success: true,
      message: 'Sticky note deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting sticky note:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// Toggle pin status
export const togglePin = async (req, res) => {
  try {
    const { noteId } = req.params;
    
    const stickyNote = await StickyNote.findById(noteId);
    
    if (!stickyNote) {
      return res.status(404).json({
        success: false,
        message: 'Sticky note not found'
      });
    }
    
    // Toggle pin status
    stickyNote.isPinned = !stickyNote.isPinned;
    await stickyNote.save();
    
    res.json({
      success: true,
      message: stickyNote.isPinned ? 'Note pinned' : 'Note unpinned',
      isPinned: stickyNote.isPinned
    });
  } catch (error) {
    console.error('Error toggling pin:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// Update note position
export const updatePosition = async (req, res) => {
  try {
    const { noteId } = req.params;
    const { x, y } = req.body;
    
    await StickyNote.findByIdAndUpdate(noteId, {
      position: { x, y }
    });
    
    res.json({
      success: true,
      message: 'Position updated successfully'
    });
  } catch (error) {
    console.error('Error updating position:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// Reorder notes
export const reorderNotes = async (req, res) => {
  try {
    const { noteId } = req.params;
    const { order } = req.body;
    
    await StickyNote.findByIdAndUpdate(noteId, { order });
    
    res.json({
      success: true,
      message: 'Order updated successfully'
    });
  } catch (error) {
    console.error('Error reordering notes:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};