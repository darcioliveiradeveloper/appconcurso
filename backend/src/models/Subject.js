import mongoose from 'mongoose';

const subjectSchema = new mongoose.Schema({
  code: {
    type: String,
    required: true,
    unique: true
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
  cargos: [{ type: String }], // vazio = comum a todos; ou lista de cargo codes específicos
  bloco: { type: String, enum: ['Gerais', 'Específicos', 'Único'], default: 'Único' },
  description: String,
  order: { type: Number, default: 0 }
}, {
  timestamps: true
});

export default mongoose.model('Subject', subjectSchema);