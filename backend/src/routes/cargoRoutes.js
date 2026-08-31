import express from 'express';
import Cargo from '../models/Cargo.js';
import Subject from '../models/Subject.js';
import { protect } from '../middlewares/auth.js';

const router = express.Router();

router.get('/', protect, async (req, res, next) => {
  try {
    const cargos = await Cargo.find().sort({ code: 1 }).lean();
    // anexa contagem de questões disponíveis por cargo
    const subjects = await Subject.find().lean();
    const subjMap = {};
    subjects.forEach(s => subjMap[s.code] = s._id);

    const Question = (await import('../models/Question.js')).default;
    const result = [];
    for (const cargo of cargos) {
      let disponivel = 0;
      for (const item of cargo.distribuicao) {
        const subjId = subjMap[item.subjectCode];
        if (!subjId) continue;
        const count = await Question.countDocuments({ subject: subjId });
        disponivel += Math.min(count, item.quantidade);
      }
      result.push({ ...cargo, disponivel, total: cargo.totalQuestoes });
    }
    res.json({ cargos: result });
  } catch (e) { next(e); }
});

router.get('/:code', protect, async (req, res, next) => {
  try {
    const cargo = await Cargo.findOne({ code: req.params.code.toUpperCase() });
    if (!cargo) return res.status(404).json({ message: 'Cargo não encontrado' });
    res.json({ cargo });
  } catch (e) { next(e); }
});

export default router;
