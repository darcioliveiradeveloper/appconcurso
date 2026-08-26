import express from 'express';
import { getSubjects, getSubjectById, getTopics } from '../controllers/subjectController.js';
import { protect } from '../middlewares/auth.js';

const router = express.Router();

router.get('/', protect, getSubjects);
router.get('/topics', protect, getTopics);
router.get('/:id', protect, getSubjectById);

export default router;