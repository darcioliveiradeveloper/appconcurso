import express from 'express';
import { generateAccessCodes, listAccessCodes, revokeAccessCode, generateForUser } from '../controllers/accessCodeController.js';
import { protect, authorize } from '../middlewares/auth.js';

const router = express.Router();

router.use(protect, authorize('admin'));

router.post('/generate', generateAccessCodes);
router.post('/for-user', generateForUser);
router.get('/', listAccessCodes);
router.delete('/:id', revokeAccessCode);

export default router;
