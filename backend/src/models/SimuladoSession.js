import mongoose from 'mongoose';

const answerSchema = new mongoose.Schema({
  question: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Question',
    required: true
  },
  selectedIndex: {
    type: Number,
    min: 0,
    max: 3
  },
  correct: Boolean,
  timeMs: Number,
  answeredAt: { type: Date, default: Date.now }
}, { _id: false });

const simuladoSessionSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  mode: {
    type: String,
    enum: ['study', 'exam', 'focus'],
    required: true
  },
  subject: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Subject'
  },
  cargoCode: { type: String, uppercase: true, trim: true }, // ex: PREF_TI, DEL_PCPR
  totalQuestions: {
    type: Number,
    required: true
  },
  config: {
    timeLimitMinutes: Number,
    shuffle: { type: Boolean, default: true }
  },
  status: {
    type: String,
    enum: ['in_progress', 'finished', 'abandoned'],
    default: 'in_progress'
  },
  startedAt: { type: Date, default: Date.now },
  finishedAt: Date,
  currentQuestionIndex: { type: Number, default: 0 },
  questionOrder: [mongoose.Schema.Types.ObjectId],
  answers: [answerSchema],
  result: {
    score: Number,
    passed: Boolean,
    bySubject: [{
      subject: { type: mongoose.Schema.Types.ObjectId, ref: 'Subject' },
      correct: Number,
      total: Number,
      percentage: Number,
      minRequired: Number
    }],
    recommendations: [{
      topic: String,
      priority: { type: String, enum: ['high', 'medium', 'low'] },
      reason: String
    }]
  }
}, {
  timestamps: true
});

simuladoSessionSchema.index({ user: 1, createdAt: -1 });
simuladoSessionSchema.index({ user: 1, mode: 1, status: 1 });

export default mongoose.model('SimuladoSession', simuladoSessionSchema);