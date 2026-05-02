import express from 'express';
import * as todoController from '../controllers/todoController.js';
import { authMiddleware as protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// All routes require authentication
router.use(protect);

// Get all todos with optional filters
router.get('/', todoController.getTodos);

// Get todo statistics
router.get('/stats', todoController.getTodoStats);

// Create new todo
router.post('/', todoController.createTodo);

// Update todo
router.put('/:id', todoController.updateTodo);

// Delete todo
router.delete('/:id', todoController.deleteTodo);

// Toggle todo completion
router.patch('/:id/toggle', todoController.toggleTodo);

// Bulk update todos
router.patch('/bulk-update', todoController.bulkUpdateTodos);

// Quick add todo
router.post('/quick-add', todoController.quickAddTodo);

export default router;