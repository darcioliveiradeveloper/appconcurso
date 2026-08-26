import User from '../models/User.js';
import { generateTokens, verifyRefreshToken } from '../config/jwt.js';
import { AppError } from '../middlewares/errorHandler.js';

export const register = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;
    
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return next(new AppError('Email já cadastrado', 400));
    }
    
    const user = await User.create({ name, email, password, role: 'user' });
    const { accessToken, refreshToken } = generateTokens(user);
    
    res.status(201).json({
      user: user.toJSON(),
      accessToken,
      refreshToken
    });
  } catch (error) {
    next(error);
  }
};

export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    
    const user = await User.findOne({ email }).select('+password');
    if (!user || !(await user.comparePassword(password))) {
      return next(new AppError('Email ou senha inválidos', 401));
    }
    
    if (!user.isActive) {
      return next(new AppError('Conta desativada', 401));
    }
    
    user.lastLogin = new Date();
    await user.save({ validateBeforeSave: false });
    
    const { accessToken, refreshToken } = generateTokens(user);
    
    res.json({
      user: user.toJSON(),
      accessToken,
      refreshToken
    });
  } catch (error) {
    next(error);
  }
};

export const refresh = async (req, res, next) => {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) {
      return next(new AppError('Refresh token não fornecido', 400));
    }
    
    const decoded = verifyRefreshToken(refreshToken);
    const user = await User.findById(decoded.id);
    
    if (!user || !user.isActive) {
      return next(new AppError('Usuário não encontrado', 401));
    }
    
    const tokens = generateTokens(user);
    res.json(tokens);
  } catch (error) {
    next(new AppError('Refresh token inválido ou expirado', 401));
  }
};

export const me = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    res.json({ user: user.toJSON() });
  } catch (error) {
    next(error);
  }
};

export const logout = async (req, res) => {
  res.json({ message: 'Logout realizado' });
};