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
import accessCodeRoutes from './routes/accessCodeRoutes.js';
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

    const TARGETS = { PORT: 50, MAT: 50, INF: 50, GER: 50, ESP: 200 };

    await Promise.all([Subject.deleteMany({}), Question.deleteMany({})]);
    const subjects = await Subject.insertMany(SUBJECTS);
    const subjectMap = {};
    subjects.forEach(s => subjectMap[s.code] = s._id);

    const seedsDir = path.resolve(__dirname, 'seeds');
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

    const NOVAS = {
      MAT: [
        { topic: 'Regra de Três', difficulty: 'easy', text: 'Um servidor imprime 150 páginas em 5 minutos, mantendo o mesmo ritmo. Quantas páginas ele imprimirá em 12 minutos?', alternatives: ['300 páginas', '360 páginas', '420 páginas', '480 páginas'], correctIndex: 1, explanation: 'Regra de três: 150/5 = 30 páginas por minuto. Em 12 minutos: 30 x 12 = 360.' },
        { topic: 'Equações', difficulty: 'easy', text: 'Resolvendo a equação x/3 = 12, qual é o valor de x?', alternatives: ['4', '9', '36', '15'], correctIndex: 2, explanation: 'x/3 = 12 => x = 12 x 3 = 36.' },
        { topic: 'Porcentagem', difficulty: 'medium', text: 'Um equipamento custa R$ 800,00 e recebe 25% de desconto à vista. Qual o valor final a pagar?', alternatives: ['R$ 550,00', 'R$ 650,00', 'R$ 700,00', 'R$ 600,00'], correctIndex: 3, explanation: 'Desconto de 25% de 800 = 200. Valor final: 800 - 200 = 600.' }
      ],
      INF: [
        { topic: 'Excel', difficulty: 'medium', text: 'No Microsoft Excel, qual função soma apenas os valores de um intervalo que atendem a um determinado critério?', alternatives: ['SOMA', 'SOMASE', 'MÉDIASE', 'CONT.SE'], correctIndex: 1, explanation: 'SOMASE (SUMIF) soma valores condicionados a um critério.' },
        { topic: 'Windows', difficulty: 'easy', text: 'No Windows, o atalho Ctrl + Z tem a função de:', alternatives: ['Refazer', 'Copiar', 'Desfazer a última ação', 'Colar especial'], correctIndex: 2, explanation: 'Ctrl+Z desfaz; Ctrl+Y refaz.' },
        { topic: 'Segurança', difficulty: 'medium', text: 'Qual técnica sobrecarrega um servidor com milhares de requisições até torná-lo indisponível?', alternatives: ['Phishing', 'Força bruta', 'Man-in-the-middle', 'DDoS'], correctIndex: 3, explanation: 'DDoS satura os recursos do servidor com tráfego massivo.' },
        { topic: 'Internet', difficulty: 'easy', text: 'O navegador de internet é classificado como software destinado a:', alternatives: ['Gerenciar arquivos', 'Acessar e exibir páginas da web', 'Proteger contra vírus', 'Editar documentos'], correctIndex: 1, explanation: 'Navegadores interpretam HTML e exibem conteúdo web.' },
        { topic: 'Arquivos', difficulty: 'easy', text: 'Qual extensão corresponde ao formato padrão do Microsoft Word (versões modernas)?', alternatives: ['.docx', '.xlsx', '.pptx', '.odp'], correctIndex: 0, explanation: '.docx = Word | .xlsx = Excel | .pptx = PowerPoint.' }
      ],
      GER: [
        { topic: 'Economia PG', difficulty: 'medium', text: 'O TecnoParque de Ponta Grossa (PR) tem como principal objetivo fomentar:', alternatives: ['Turismo rural', 'Inovação e empresas de base tecnológica', 'Exploração mineral', 'Eventos esportivos'], correctIndex: 1, explanation: 'O TecnoParque é voltado à inovação, P&D e empresas de TIC.' },
        { topic: 'Saúde', difficulty: 'medium', text: 'Segundo o SUS, a porta de entrada preferencial do usuário é:', alternatives: ['UBS (Atenção Básica)', 'Hospitais de alta complexidade', 'Atendimento privado conveniado', 'Farmácias populares'], correctIndex: 0, explanation: 'A Atenção Básica/UBS é a porta de entrada do SUS.' }
      ]
    };

    const balanceLog = [];
    for (const [code, target] of Object.entries(TARGETS)) {
      const subjectId = subjectMap[code];
      if (!subjectId) continue;
      let count = await Question.countDocuments({ subject: subjectId });

      if (count > target) {
        const extra = count - target;
        const excess = await Question.find({ subject: subjectId }).sort({ _id: -1 }).limit(extra).select('_id');
        await Question.deleteMany({ _id: { $in: excess.map(e => e._id) } });
        count -= extra;
        balanceLog.push(`${code}: removidas ${extra} excesso`);
      }

      if (count < target && NOVAS[code]) {
        const falta = target - count;
        const inserir = NOVAS[code].slice(0, falta).map(q => ({
          subject: subjectId, topic: q.topic, difficulty: q.difficulty,
          text: q.text, alternatives: q.alternatives, correctIndex: q.correctIndex,
          explanation: q.explanation, source: 'Balanceamento', tags: [code],
          timesAnswered: 0, timesCorrect: 0, avgTimeMs: 0
        }));
        if (inserir.length) {
          await Question.insertMany(inserir);
          count += inserir.length;
          balanceLog.push(`${code}: inseridas ${inserir.length} novas`);
        }
      }
      balanceLog.push(`${code}: ${count}/${target}`);
    }

    const adminEmail = process.env.ADMIN_EMAIL;
    const adminPassword = process.env.ADMIN_PASSWORD;
    if (adminEmail && adminPassword) {
      await User.deleteOne({ email: adminEmail });
      await User.create({ name: 'Admin', email: adminEmail, password: adminPassword, role: 'admin' });
    }

    const counts = {};
    for (const s of subjects) {
      counts[s.code] = await Question.countDocuments({ subject: s._id });
    }
    const total = await Question.countDocuments();
    res.json({ message: 'Seed + balance concluídos!', counts, total, balanceLog, admin: adminEmail });
  } catch (error) {
    res.status(500).json({ message: 'Erro no seed', error: error.message });
  }
});

app.use('/api/auth', authRoutes);
app.use('/api/subjects', subjectRoutes);
app.use('/api/simulados', simuladoRoutes);
app.use('/api/access-codes', accessCodeRoutes);

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