export const errorHandler = (err, req, res, next) => {
  console.error('Erro:', err);
  
  if (err.name === 'ValidationError') {
    const messages = Object.values(err.errors).map(e => e.message);
    return res.status(400).json({ message: 'Erro de validação', errors: messages });
  }
  
  if (err.name === 'CastError') {
    return res.status(400).json({ message: 'ID inválido' });
  }
  
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    return res.status(400).json({ message: `${field} já cadastrado` });
  }
  
  if (err.name === 'MongoServerError') {
    return res.status(500).json({ message: 'Erro no banco de dados' });
  }
  
  res.status(err.statusCode || 500).json({
    message: err.message || 'Erro interno do servidor'
  });
};

export class AppError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;
    Error.captureStackTrace(this, this.constructor);
  }
}