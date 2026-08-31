import AccessCode from '../models/AccessCode.js';
import { AppError } from '../middlewares/errorHandler.js';
import crypto from 'crypto';

function generateCode() {
  // Formato: XXXXX-XXXXX (10 caracteres, sem caracteres ambíguos)
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < 10; i++) {
    if (i === 5) code += '-';
    code += chars[crypto.randomInt(chars.length)];
  }
  return code;
}

export const generateAccessCodes = async (req, res, next) => {
  try {
    const { quantity = 1 } = req.body;
    if (quantity < 1 || quantity > 100) {
      return next(new AppError('Quantidade deve ser entre 1 e 100', 400));
    }

    const codes = [];
    for (let i = 0; i < quantity; i++) {
      let code;
      let exists = true;
      while (exists) {
        code = generateCode();
        exists = await AccessCode.exists({ code });
      }
      const doc = await AccessCode.create({ code, createdBy: req.user._id });
      codes.push(doc.code);
    }

    res.status(201).json({ codes, quantity: codes.length });
  } catch (error) {
    next(error);
  }
};

export const listAccessCodes = async (req, res, next) => {
  try {
    const { page = 1, limit = 100, status } = req.query;
    const filter = {};
    if (status === 'used') filter.usedAt = { $ne: null };
    if (status === 'available') filter.usedAt = null;

    const codes = await AccessCode.find(filter)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit))
      .populate('usedBy', 'name email')
      .select('code usedBy usedAt createdAt')
      .lean();

    const total = await AccessCode.countDocuments(filter);

    res.json({
      codes: codes.map(c => ({
        _id: c._id,
        code: c.code,
        used: Boolean(c.usedAt),
        usedBy: c.usedBy,
        usedAt: c.usedAt,
        createdAt: c.createdAt
      })),
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        available: await AccessCode.countDocuments({ usedAt: null }),
        used: await AccessCode.countDocuments({ usedAt: { $ne: null } })
      }
    });
  } catch (error) {
    next(error);
  }
};

export const revokeAccessCode = async (req, res, next) => {
  try {
    const { id } = req.params;
    const code = await AccessCode.findById(id);
    if (!code) {
      return next(new AppError('Código não encontrado', 404));
    }
    if (code.usedAt) {
      return next(new AppError('Código já utilizado, não pode ser revogado', 400));
    }
    await code.deleteOne();
    res.json({ message: 'Código revogado' });
  } catch (error) {
    next(error);
  }
};
