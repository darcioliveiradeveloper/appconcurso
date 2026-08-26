import Question from '../models/Question.js';
import SimuladoSession from '../models/SimuladoSession.js';

export const recommendationService = {
  async generate(session) {
    const recommendations = [];
    const topicStats = {};
    
    // Agrupa erros por tópico
    for (const answer of session.answers) {
      if (!answer.correct) {
        const question = await Question.findById(answer.question).select('topic subject difficulty');
        if (!question) continue;
        
        const key = `${question.subject}-${question.topic}`;
        if (!topicStats[key]) {
          topicStats[key] = { topic: question.topic, subject: question.subject, errors: 0, total: 0, difficulty: question.difficulty };
        }
        topicStats[key].errors++;
        topicStats[key].total++;
      } else {
        const question = await Question.findById(answer.question).select('topic subject');
        if (!question) continue;
        const key = `${question.subject}-${question.topic}`;
        if (!topicStats[key]) {
          topicStats[key] = { topic: question.topic, subject: question.subject, errors: 0, total: 0 };
        }
        topicStats[key].total++;
      }
    }
    
    // Gera recomendações baseadas na taxa de erro
    for (const [key, stats] of Object.entries(topicStats)) {
      const errorRate = stats.errors / stats.total;
      if (errorRate >= 0.5) {
        recommendations.push({
          topic: stats.topic,
          priority: 'high',
          reason: `Taxa de erro de ${Math.round(errorRate * 100)}% (${stats.errors}/${stats.total})`
        });
      } else if (errorRate >= 0.3) {
        recommendations.push({
          topic: stats.topic,
          priority: 'medium',
          reason: `Taxa de erro de ${Math.round(errorRate * 100)}% (${stats.errors}/${stats.total})`
        });
      }
    }
    
    // Ordena por prioridade
    const priorityOrder = { high: 0, medium: 1, low: 2 };
    recommendations.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);
    
    return recommendations.slice(0, 10);
  },
  
  async getFocusQuestions(userId, limit = 20) {
    // Busca sessões recentes do usuário
    const recentSessions = await SimuladoSession.find({
      user: userId,
      status: 'finished'
    }).sort({ finishedAt: -1 }).limit(10).lean();
    
    // Identifica questões erradas
    const wrongQuestionIds = new Set();
    const topicErrors = {};
    
    for (const session of recentSessions) {
      for (const answer of session.answers) {
        if (!answer.correct) {
          wrongQuestionIds.add(answer.question.toString());
          const q = await Question.findById(answer.question).select('topic difficulty');
          if (q) {
            const key = q.topic;
            topicErrors[key] = (topicErrors[key] || 0) + 1;
          }
        }
      }
    }
    
    // Busca questões dos tópicos com mais erros
    const topTopics = Object.entries(topicErrors)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([topic]) => topic);
    
    if (topTopics.length === 0) {
      // Fallback: questões aleatórias
      return Question.aggregate([{ $sample: { size: limit } }]);
    }
    
    const questions = await Question.aggregate([
      { $match: { topic: { $in: topTopics } } },
      { $sample: { size: limit } }
    ]);
    
    return questions;
  }
};