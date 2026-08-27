import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import connectDB from './config/db.js';
import { errorHandler } from './middlewares/errorHandler.js';

import authRoutes from './routes/authRoutes.js';
import subjectRoutes from './routes/subjectRoutes.js';
import simuladoRoutes from './routes/simuladoRoutes.js';
import Subject from './models/Subject.js';
import Question from './models/Question.js';
import User from './models/User.js';
import fs from 'fs';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;
const isProduction = process.env.NODE_ENV === 'production';

connectDB();

const allowedOrigins = isProduction
  ? [process.env.RENDER_EXTERNAL_URL || 'https://appconcurso.onrender.com']
  : ['http://localhost:5173', 'http://localhost:5174'];

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(null, true);
    }
  },
  credentials: true
}));
app.use(express.json());
app.use(morgan(isProduction ? 'combined' : 'dev'));

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.get('/api/seed', async (req, res) => {
  try {
    if (req.query.key !== process.env.ADMIN_PASSWORD) {
      return res.status(403).json({ message: 'Chave inválida' });
    }

    const SUBJECTS = [
      { code: 'PORT', name: 'Língua Portuguesa', icon: '📝', color: '#3B82F6', examWeight: 5, examQuestions: 5, minScore: 1, order: 1 },
      { code: 'MAT', name: 'Matemática', icon: '🔢', color: '#10B981', examWeight: 5, examQuestions: 5, minScore: 1, order: 2 },
      { code: 'INF', name: 'Informática Básica', icon: '💻', color: '#8B5CF6', examWeight: 5, examQuestions: 5, minScore: 1, order: 3 },
      { code: 'GER', name: 'Conhecimentos Gerais', icon: '🌍', color: '#F59E0B', examWeight: 5, examQuestions: 5, minScore: 1, order: 4 },
      { code: 'ESP', name: 'Conhecimentos Específicos', icon: '⚙️', color: '#EF4444', examWeight: 20, examQuestions: 20, minScore: 7, order: 5 }
    ];

    await Promise.all([Subject.deleteMany({}), Question.deleteMany({})]);
    const subjects = await Subject.insertMany(SUBJECTS);
    const subjectMap = {};
    subjects.forEach(s => subjectMap[s.code] = s._id);

    const seedsDir = path.resolve(__dirname, '../seeds');
    const load = f => JSON.parse(fs.readFileSync(path.join(seedsDir, f), 'utf-8'));
    const data = [...load('questions_data.json'), ...load('gemini_questions.json')];

    const docs = [];
    for (const q of data) {
      if (!q.alternatives || q.alternatives.length !== 4 || q.correct == null) continue;
      const subjectId = subjectMap[q.subjectCode];
      if (!subjectId) continue;
      docs.push({
        subject: subjectId,
        topic: q.topic || 'Geral',
        difficulty: (q.number ?? 0) % 25 < 8 ? 'easy' : (q.number ?? 0) % 25 < 17 ? 'medium' : 'hard',
        text: q.text.trim(),
        alternatives: q.alternatives.map(a => a.replace(/\s+/g, ' ').trim()),
        correctIndex: q.correct,
        explanation: q.explanation || '',
        source: q.label || 'importado',
        tags: [q.subjectCode]
      });
    }

    for (let i = 0; i < docs.length; i += 100) {
      await Question.insertMany(docs.slice(i, i + 100), { ordered: false });
    }

    const adminEmail = process.env.ADMIN_EMAIL;
    const adminPassword = process.env.ADMIN_PASSWORD;
    if (adminEmail && adminPassword) {
      await User.deleteOne({ email: adminEmail });
      await User.create({ name: 'Admin', email: adminEmail, password: adminPassword, role: 'admin' });
    }

    const total = await Question.countDocuments();
    res.json({ message: 'Seed concluído!', subjects: subjects.length, questions: total, admin: adminEmail });
  } catch (error) {
    res.status(500).json({ message: 'Erro no seed', error: error.message });
  }
});

app.use('/api/auth', authRoutes);
app.use('/api/subjects', subjectRoutes);
app.use('/api/simulados', simuladoRoutes);

if (isProduction) {
  const frontendDist = path.resolve(__dirname, '../../frontend/dist');
  app.use(express.static(frontendDist));
  app.get('*', (req, res) => {
    res.sendFile(path.join(frontendDist, 'index.html'));
  });
} else {
  app.use((req, res) => {
    res.status(404).json({ message: 'Rota não encontrada' });
  });
}

app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT} [${isProduction ? 'PROD' : 'DEV'}]`);
});

export default app;