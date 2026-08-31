import mongoose from 'mongoose';

const accessCodeSchema = new mongoose.Schema({
  code: {
    type: String,
    required: true,
    unique: true,
    uppercase: true,
    trim: true
  },
  usedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  usedAt: Date,
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, {
  timestamps: true
});

accessCodeSchema.virtual('isUsed').get(function() {
  return Boolean(this.usedAt);
});

accessCodeSchema.set('toJSON', { virtuals: true });

export default mongoose.model('AccessCode', accessCodeSchema);
