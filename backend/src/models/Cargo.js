import mongoose from 'mongoose';

const cargoSchema = new mongoose.Schema({
  code: {
    type: String,
    required: true,
    unique: true,
    uppercase: true,
    trim: true
  },
  nome: { type: String, required: true },
  orgao: { type: String, required: true },
  totalQuestoes: { type: Number, required: true },
  // Distribuição da prova objetiva conforme edital
  distribuicao: [{
    subjectCode: { type: String, required: true },
    subjectName: { type: String, required: true },
    quantidade: { type: Number, required: true },
    peso: { type: Number, default: 1 },
    bloco: { type: String, enum: ['Gerais', 'Específicos', 'Único'], default: 'Único' }
  }]
}, {
  timestamps: true
});

export default mongoose.model('Cargo', cargoSchema);
