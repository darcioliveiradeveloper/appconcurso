import mongoose from 'mongoose';

const questionSchema = new mongoose.Schema({
  subject: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Subject',
    required: true,
    index: true
  },
  topic: {
    type: String,
    required: true,
    index: true
  },
  difficulty: {
    type: String,
    enum: ['easy', 'medium', 'hard'],
    default: 'medium',
    index: true
  },
  text: {
    type: String,
    required: true
  },
  alternatives: [{
    type: String,
    required: true
  }],
  correctIndex: {
    type: Number,
    required: true,
    min: 0,
    max: 3
  },
  explanation: String,
  source: {
    type: String,
    default: 'imported'
  },
  tags: [String],
  timesAnswered: { type: Number, default: 0 },
  timesCorrect: { type: Number, default: 0 },
  avgTimeMs: { type: Number, default: 0 }
}, {
  timestamps: true
});

questionSchema.index({ subject: 1, topic: 1 });
questionSchema.index({ subject: 1, difficulty: 1 });
questionSchema.index({ text: 'text' });

export default mongoose.model('Question', questionSchema);