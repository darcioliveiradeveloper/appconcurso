import Subject from '../models/Subject.js';
import Question from '../models/Question.js';
import { AppError } from '../middlewares/errorHandler.js';

export const getSubjects = async (req, res, next) => {
  try {
    const subjects = await Subject.find().sort({ order: 1 }).lean();
    
    const subjectsWithCount = await Promise.all(
      subjects.map(async (subject) => {
        const count = await Question.countDocuments({ subject: subject._id });
        return { ...subject, questionCount: count };
      })
    );
    
    res.json({ subjects: subjectsWithCount });
  } catch (error) {
    next(error);
  }
};

export const getSubjectById = async (req, res, next) => {
  try {
    const subject = await Subject.findById(req.params.id);
    if (!subject) {
      return next(new AppError('Matéria não encontrada', 404));
    }
    
    const count = await Question.countDocuments({ subject: subject._id });
    const topics = await Question.distinct('topic', { subject: subject._id });
    
    res.json({ subject: { ...subject.toObject(), questionCount: count, topics } });
  } catch (error) {
    next(error);
  }
};

export const getTopics = async (req, res, next) => {
  try {
    const { subjectId } = req.query;
    const filter = subjectId ? { subject: subjectId } : {};
    const topics = await Question.distinct('topic', filter);
    res.json({ topics });
  } catch (error) {
    next(error);
  }
};