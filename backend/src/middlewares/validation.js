import { z } from 'zod';

export const validate = (schema) => (req, res, next) => {
  try {
    req.body = schema.parse(req.body);
    next();
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        message: 'Dados inválidos',
        errors: error.errors.map(e => ({
          field: e.path.join('.'),
          message: e.message
        }))
      });
    }
    next(error);
  }
};

export const schemas = {
  register: z.object({
    name: z.string().min(2, 'Nome deve ter pelo menos 2 caracteres').max(100),
    email: z.string().email('Email inválido'),
    password: z.string().min(6, 'Senha deve ter pelo menos 6 caracteres'),
    accessCode: z.string().min(10, 'Código de liberação inválido').max(20)
  }),
  
  login: z.object({
    email: z.string().email('Email inválido'),
    password: z.string().min(1, 'Senha é obrigatória')
  }),
  
  createSimulado: z.object({
    subjectId: z.string().optional(),
    cargoCode: z.string().optional(),
    mode: z.enum(['study', 'exam', 'focus']).default('study'),
    totalQuestions: z.number().int().min(1).max(100).optional(),
    timeLimitMinutes: z.number().int().min(1).max(300).optional()
  }),
  
  answer: z.object({
    selectedIndex: z.number().int().min(0).max(3)
  })
};