import mongoose from 'mongoose';
import dotenv from 'dotenv';
import connectDB from '../config/db.js';
import Subject from '../models/Subject.js';
import Question from '../models/Question.js';
import User from '../models/User.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const SUBJECTS = [
  { code: 'PORT', name: 'Língua Portuguesa', icon: '📝', color: '#3B82F6', examWeight: 5, examQuestions: 5, minScore: 1, order: 1 },
  { code: 'MAT', name: 'Matemática', icon: '🔢', color: '#10B981', examWeight: 5, examQuestions: 5, minScore: 1, order: 2 },
  { code: 'INF', name: 'Informática Básica', icon: '💻', color: '#8B5CF6', examWeight: 5, examQuestions: 5, minScore: 1, order: 3 },
  { code: 'GER', name: 'Conhecimentos Gerais', icon: '🌍', color: '#F59E0B', examWeight: 5, examQuestions: 5, minScore: 1, order: 4 },
  { code: 'ESP', name: 'Conhecimentos Específicos', icon: '⚙️', color: '#EF4444', examWeight: 20, examQuestions: 20, minScore: 7, order: 5 }
];

function determineDifficulty(index) {
  const pos = index % 25;
  if (pos < 8) return 'easy';
  if (pos < 17) return 'medium';
  return 'hard';
}

async function seed() {
  try {
    await connectDB();

    console.log('🌱 Iniciando seed...');

    await Promise.all([
      Subject.deleteMany({}),
      Question.deleteMany({})
    ]);
    console.log('🗑️ Collections limpas (usuários preservados)');

    const subjects = await Subject.insertMany(SUBJECTS);
    const subjectMap = {};
    subjects.forEach(s => subjectMap[s.code] = s._id);
    console.log('📚 Subjects criados:', subjects.length);

    // Carrega JSONs limpos (md próprios + Gemini gabaritado)
    const load = f => JSON.parse(fs.readFileSync(path.join(__dirname, f), 'utf-8'));
    const data = [
      ...load('questions_data.json'),
      ...load('gemini_questions.json')
    ];
    console.log('📥 Questões no JSON:', data.length);

    const docs = [];
    let skipped = 0;

    for (const q of data) {
      if (!q.alternatives || q.alternatives.length !== 4 || q.correct == null) {
        skipped++;
        continue;
      }
      const subjectId = subjectMap[q.subjectCode];
      if (!subjectId) { skipped++; continue; }

      docs.push({
        subject: subjectId,
        topic: q.topic || 'Geral',
        difficulty: determineDifficulty(q.number ?? 0),
        text: q.text.trim(),
        alternatives: q.alternatives.map(a => a.replace(/\s+/g, ' ').trim()),
        correctIndex: q.correct,
        explanation: q.explanation || '',
        source: q.label || 'importado',
        tags: [q.subjectCode]
      });
    }

    console.log(`✅ Válidas: ${docs.length} | Puladas: ${skipped}`);

    for (let i = 0; i < docs.length; i += 100) {
      await Question.insertMany(docs.slice(i, i + 100), { ordered: false });
    }
    console.log('💾 Questões inseridas');

    // Admin
    const adminEmail = process.env.ADMIN_EMAIL;
    const adminPassword = process.env.ADMIN_PASSWORD;
    const adminExists = await User.findOne({ email: adminEmail });
    if (!adminExists && adminEmail && adminPassword) {
      await User.create({ name: 'Admin', email: adminEmail, password: adminPassword, role: 'admin' });
      console.log('👤 Admin criado:', adminEmail);
    } else {
      console.log('👤 Admin já existe ou .env incompleto');
    }

    // Estatísticas por matéria e tópico
    const stats = await Question.aggregate([
      {
        $group: {
          _id: '$subject',
          count: { $sum: 1 },
          topics: { $addToSet: '$topic' }
        }
      }
    ]);
    console.log('\n📊 Estatísticas:');
    for (const stat of stats) {
      const subj = subjects.find(s => s._id.toString() === stat._id.toString());
      console.log(`  ${subj?.code}: ${stat.count} questões (${stat.topics.length} tópicos)`);
    }

    const total = await Question.countDocuments();
    console.log(`\n✅ Seed concluído! Total no banco: ${total}`);
    process.exit(0);
  } catch (error) {
    console.error('❌ Erro no seed:', error.message);
    process.exit(1);
  }
}

seed();