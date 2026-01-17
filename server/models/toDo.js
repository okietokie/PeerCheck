import mongoose from "mongoose";

const todoSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
  },
  description: {
    type: String,
    trim: true,
  },
  completed: {
    type: Boolean,
    default: false,
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high'],
    default: 'medium',
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  project: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Project',
  },
  dueDate: {
    type: Date,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
  tags: [{
    type: String,
    trim: true,
  }],
  category: {
    type: String,
    enum: ['personal', 'work', 'shopping', 'study', 'health', 'other'],
    default: 'personal',
  },
});

// Update timestamp on save
todoSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Index for faster queries
todoSchema.index({ user: 1, completed: 1, dueDate: 1 });
todoSchema.index({ user: 1, project: 1 });

const Todo = mongoose.model('Todo', todoSchema);
export default Todo;