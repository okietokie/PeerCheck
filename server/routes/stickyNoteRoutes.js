import express from 'express';
import {authMiddleware as auth} from '../middleware/authMiddleware.js';
import { createStickyNote, deleteStickyNote, getStickyNotes, reorderNotes, togglePin, updatePosition, updateStickyNote } from '../controllers/stickyNoteController.js';

const router = express.Router();

// All routes require authentication
router.use(auth);

// CRUD operations
router.post('/create-new-note/:projectId', createStickyNote);
router.get('/:projectId', getStickyNotes);
router.put('/update-note/:noteId', updateStickyNote);
router.delete('/delete-note/:noteId', deleteStickyNote);
router.patch('/:noteId/pin', togglePin);
router.patch('/:noteId/position', updatePosition);
router.patch('/:noteId/reorder', reorderNotes);

export default router;