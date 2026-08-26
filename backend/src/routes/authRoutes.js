import express from 'express';
import { register, login, refresh, me, logout } from '../controllers/authController.js';
import { protect } from '../middlewares/auth.js';
import { validate, schemas } from '../middlewares/validation.js';

const router = express.Router();

router.post('/register', validate(schemas.register), register);
router.post('/login', validate(schemas.login), login);
router.post('/refresh', refresh);
router.get('/me', protect, me);
router.post('/logout', protect, logout);

export default router;