import Question from '../models/Question.js';
import SimuladoSession from '../models/SimuladoSession.js';
import Subject from '../models/Subject.js';
import { recommendationService } from '../services/recommendationService.js';
import { AppError } from '../middlewares/errorHandler.js';

const EXAM_CONFIG = {
  PORT: { weight: 5, minScore: 1 },
  MAT: { weight: 5, minScore: 1 },
  INF: { weight: 5, minScore: 1 },
  GER: { weight: 5, minScore: 1 },
  ESP: { weight: 20, minScore: 7 }
};

function shuffleArray(array) {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

export const startSimulado = async (req, res, next) => {
  try {
    const { subjectId, mode = 'study', totalQuestions, timeLimitMinutes } = req.body;
    const userId = req.user._id;
    
    let questions = [];
    let subject = null;
    
    if (mode === 'exam') {
      // Modo prova oficial: distribuição fixa do edital
      const subjects = await Subject.find().lean();
      for (const subj of subjects) {
        const config = EXAM_CONFIG[subj.code];
        const qCount = config?.weight || 5;
        const subjQuestions = await Question.aggregate([
          { $match: { subject: subj._id } },
          { $sample: { size: qCount } }
        ]);
        questions.push(...subjQuestions);
      }
      questions = shuffleArray(questions).slice(0, 40);
    } else if (mode === 'focus') {
      // Modo foco nas difíceis
      questions = await recommendationService.getFocusQuestions(userId, totalQuestions || 20);
    } else {
      // Modo estudo livre
      if (!subjectId) {
        return next(new AppError('SubjectId é obrigatório para modo estudo', 400));
      }
      subject = await Subject.findById(subjectId);
      if (!subject) {
        return next(new AppError('Matéria não encontrada', 404));
      }
      
      const qCount = totalQuestions || 20;
      questions = await Question.aggregate([
        { $match: { subject: subject._id } },
        { $sample: { size: qCount } }
      ]);
    }
    
    if (questions.length === 0) {
      return next(new AppError('Nenhuma questão encontrada', 404));
    }
    
    const questionOrder = questions.map(q => q._id);
    
    const session = await SimuladoSession.create({
      user: userId,
      mode,
      subject: subject?._id || null,
      totalQuestions: questions.length,
      config: {
        timeLimitMinutes: timeLimitMinutes || (mode === 'exam' ? 180 : 0),
        shuffle: true
      },
      questionOrder,
      answers: []
    });
    
    // Retorna primeira questão (sem resposta) — aggregate já retorna objeto puro
    const firstQuestion = questions[0];
    const { correctIndex, explanation, ...questionData } = firstQuestion;
    
    res.status(201).json({
      session: {
        id: session._id,
        mode: session.mode,
        totalQuestions: session.totalQuestions,
        currentIndex: 0,
        timeLimitMinutes: session.config.timeLimitMinutes,
        startedAt: session.startedAt
      },
      question: {
        ...questionData,
        alternatives: firstQuestion.alternatives
      }
    });
  } catch (error) {
    next(error);
  }
};

export const getQuestion = async (req, res, next) => {
  try {
    const { sessionId, questionIndex } = req.params;
    const index = parseInt(questionIndex);
    
    const session = await SimuladoSession.findById(sessionId);
    if (!session) {
      return next(new AppError('Sessão não encontrada', 404));
    }
    
    if (session.user.toString() !== req.user._id.toString()) {
      return next(new AppError('Acesso negado', 403));
    }
    
    if (index < 0 || index >= session.questionOrder.length) {
      return next(new AppError('Índice de questão inválido', 400));
    }
    
    const question = await Question.findById(session.questionOrder[index]).lean();
    if (!question) {
      return next(new AppError('Questão não encontrada', 404));
    }
    
    const { correctIndex, explanation, ...questionData } = question;
    
    res.json({
      question: {
        ...questionData,
        alternatives: question.alternatives
      },
      currentIndex: index,
      totalQuestions: session.totalQuestions
    });
  } catch (error) {
    next(error);
  }
};

export const submitAnswer = async (req, res, next) => {
  try {
    const { sessionId, questionIndex } = req.params;
    const { selectedIndex } = req.body;
    const index = parseInt(questionIndex);
    
    const session = await SimuladoSession.findById(sessionId);
    if (!session) {
      return next(new AppError('Sessão não encontrada', 404));
    }
    
    if (session.user.toString() !== req.user._id.toString()) {
      return next(new AppError('Acesso negado', 403));
    }
    
    if (session.status !== 'in_progress') {
      return next(new AppError('Sessão já finalizada', 400));
    }
    
    const question = await Question.findById(session.questionOrder[index]);
    if (!question) {
      return next(new AppError('Questão não encontrada', 404));
    }
    
    const correct = selectedIndex === question.correctIndex;
    const timeMs = req.body.timeMs || 0;
    
    // Atualiza estatísticas da questão
    question.timesAnswered += 1;
    if (correct) question.timesCorrect += 1;
    question.avgTimeMs = Math.round((question.avgTimeMs * (question.timesAnswered - 1) + timeMs) / question.timesAnswered);
    await question.save();
    
    // Adiciona resposta à sessão
    session.answers.push({
      question: question._id,
      selectedIndex,
      correct,
      timeMs,
      answeredAt: new Date()
    });
    session.currentQuestionIndex = index;
    await session.save();
    
    res.json({
      correct,
      correctIndex: question.correctIndex,
      explanation: question.explanation,
      nextIndex: index + 1 < session.totalQuestions ? index + 1 : null
    });
  } catch (error) {
    next(error);
  }
};

export const finishSimulado = async (req, res, next) => {
  try {
    const { sessionId } = req.params;
    
    const session = await SimuladoSession.findById(sessionId).populate('subject');
    if (!session) {
      return next(new AppError('Sessão não encontrada', 404));
    }
    
    if (session.user.toString() !== req.user._id.toString()) {
      return next(new AppError('Acesso negado', 403));
    }
    
    if (session.status === 'finished') {
      return next(new AppError('Sessão já finalizada', 400));
    }
    
    session.status = 'finished';
    session.finishedAt = new Date();
    
    // Calcula resultado
    const correctAnswers = session.answers.filter(a => a.correct).length;
    const score = Math.round((correctAnswers / session.totalQuestions) * 100);
    
    let passed = true;
    const bySubject = [];
    
    if (session.mode === 'exam') {
      // Verifica notas mínimas por disciplina
      const subjects = await Subject.find().lean();
      for (const subj of subjects) {
        const subjQuestions = session.questionOrder.filter(qId => 
          session.answers.some(a => a.question.toString() === qId.toString() && 
            session.answers.find(a => a.question.toString() === qId.toString()).question.toString() === qId.toString())
        );
        // Simplificado: agrupa por subject da questão
      }
      
      // Implementação simplificada - agrupa respostas por subject
      const subjectStats = {};
      for (const answer of session.answers) {
        const q = await Question.findById(answer.question).select('subject');
        if (!q) continue;
        const subjId = q.subject.toString();
        if (!subjectStats[subjId]) subjectStats[subjId] = { correct: 0, total: 0 };
        subjectStats[subjId].total++;
        if (answer.correct) subjectStats[subjId].correct++;
      }
      
      for (const [subjId, stats] of Object.entries(subjectStats)) {
        const subj = await Subject.findById(subjId);
        const config = EXAM_CONFIG[subj.code];
        const percentage = Math.round((stats.correct / stats.total) * 100);
        const minRequired = config?.minScore || 1;
        
        bySubject.push({
          subject: subjId,
          correct: stats.correct,
          total: stats.total,
          percentage,
          minRequired
        });
        
        if (stats.correct < minRequired) passed = false;
      }
      
      if (score < 50) passed = false;
    }
    
    // Gera recomendações
    const recommendations = await recommendationService.generate(session);
    
    session.result = {
      score,
      passed,
      bySubject,
      recommendations
    };
    
    await session.save();
    
    res.json({
      session: {
        id: session._id,
        mode: session.mode,
        totalQuestions: session.totalQuestions,
        score,
        passed,
        bySubject,
        recommendations,
        finishedAt: session.finishedAt
      }
    });
  } catch (error) {
    next(error);
  }
};

export const getHistory = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, mode } = req.query;
    const filter = { user: req.user._id, status: 'finished' };
    if (mode) filter.mode = mode;
    
    const sessions = await SimuladoSession.find(filter)
      .sort({ finishedAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit))
      .select('mode totalQuestions result score finishedAt subject')
      .populate('subject', 'name code')
      .lean();
    
    const total = await SimuladoSession.countDocuments(filter);
    
    res.json({
      sessions,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    next(error);
  }
};

export const getSessionDetail = async (req, res, next) => {
  try {
    const session = await SimuladoSession.findById(req.params.id)
      .populate('subject', 'name code')
      .populate('questionOrder', 'text alternatives correctIndex explanation topic subject')
      .populate('answers.question', 'text alternatives correctIndex explanation topic subject');
    
    if (!session) {
      return next(new AppError('Sessão não encontrada', 404));
    }
    
    if (session.user.toString() !== req.user._id.toString()) {
      return next(new AppError('Acesso negado', 403));
    }
    
    res.json({ session });
  } catch (error) {
    next(error);
  }
};