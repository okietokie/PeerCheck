import mongoose from 'mongoose';

const stickyNoteSchema = new mongoose.Schema({
  projectId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Project',
    required: true,
    index: true
  },
  title: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100
  },
  description: {
    type: String,
    required: true,
    trim: true,
    maxlength: 1000
  },
  color: {
    type: String,
    default: '#FEF9E7',
    validate: {
      validator: function(v) {
        return /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(v);
      },
      message: props => `${props.value} is not a valid hex color!`
    }
  },
  assignedUser: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  isPinned: {
    type: Boolean,
    default: false
  },
  category: {
    type: String,
    enum: ['thought', 'meeting', 'task', 'question', 'mentor'],
    default: 'thought'
  },
  isImportant: {
    type: Boolean,
    default: false
  },
  position: {
    x: { type: Number, default: 0 },
    y: { type: Number, default: 0 }
  },
  order: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Index for efficient querying
stickyNoteSchema.index({ projectId: 1, createdAt: -1 });
stickyNoteSchema.index({ projectId: 1, isPinned: -1, createdAt: -1 });

stickyNoteSchema.virtual('author', {
  ref: 'User',
  localField: 'createdBy',
  foreignField: '_id',
  justOne: true
});

// Virtual for assigned user info
stickyNoteSchema.virtual('assignedUserInfo', {
  ref: 'User',
  localField: 'assignedUser',
  foreignField: '_id',
  justOne: true
});

const StickyNote = mongoose.model('StickyNote', stickyNoteSchema);
export default StickyNote;