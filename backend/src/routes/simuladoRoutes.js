import express from 'express';
import { 
  startSimulado, 
  getQuestion, 
  submitAnswer, 
  finishSimulado,
  getHistory,
  getSessionDetail
} from '../controllers/simuladoController.js';
import { protect } from '../middlewares/auth.js';
import { validate, schemas } from '../middlewares/validation.js';

const router = express.Router();

router.post('/', protect, validate(schemas.createSimulado), startSimulado);
router.get('/history', protect, getHistory);
router.get('/:id', protect, getSessionDetail);
router.get('/:sessionId/question/:questionIndex', protect, getQuestion);
router.post('/:sessionId/question/:questionIndex/answer', protect, validate(schemas.answer), submitAnswer);
router.post('/:sessionId/finish', protect, finishSimulado);

export default router;