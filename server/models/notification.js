import mongoose from 'mongoose';

const notificationSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  
  type: {
    type: String,
    enum: [
      'task_assigned',
      'task_completed',
      'task_overdue',
      'task_comment',
      'proof_uploaded',
      'proof_verified',
      'peer_review_request',
      'peer_review_submitted',
      'project_invitation',
      'connection_request',
      'connection_accepted',
      'deadline_reminder',
      'weekly_summary',
      'system_alert'
    ],
    required: true
  },
  
  title: {
    type: String,
    required: true,
    trim: true
  },
  
  message: {
    type: String,
    required: true,
    trim: true
  },
  
  data: {
    // Flexible data object to store related IDs
    taskId: { type: mongoose.Schema.Types.ObjectId, ref: 'Task' },
    projectId: { type: mongoose.Schema.Types.ObjectId, ref: 'Project' },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    connectionId: { type: mongoose.Schema.Types.ObjectId, ref: 'Connection' },
    reviewId: { type: mongoose.Schema.Types.ObjectId, ref: 'ProjectEvaluation' },
    metadata: mongoose.Schema.Types.Mixed
  },
  
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium'
  },
  
  read: {
    type: Boolean,
    default: false,
    index: true
  },
  
  actionUrl: {
    type: String,
    trim: true
  },
  
  expiresAt: {
    type: Date,
    default: () => new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days default
  }
}, {
  timestamps: true,
  indexes: [
    { user: 1, createdAt: -1 },
    { user: 1, read: 1, createdAt: -1 },
    { expiresAt: 1 }
  ]
});

// Auto-delete expired notifications
notificationSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

const Notification = mongoose.model('Notification', notificationSchema);

export default Notification;