import mongoose from 'mongoose';

const subjectSchema = new mongoose.Schema({
  code: {
    type: String,
    required: true,
    unique: true,
    enum: ['PORT', 'MAT', 'INF', 'GER', 'ESP']
  },
  name: {
    type: String,
    required: true
  },
  icon: String,
  color: String,
  examWeight: {
    type: Number,
    required: true
  },
  examQuestions: {
    type: Number,
    required: true
  },
  minScore: {
    type: Number,
    default: 1
  },
  description: String,
  order: { type: Number, default: 0 }
}, {
  timestamps: true
});

export default mongoose.model('Subject', subjectSchema);