import mongoose from 'mongoose';

const tournamentSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 120 },
    gameTitle: { type: String, trim: true, maxlength: 120 },
    description: { type: String, trim: true, maxlength: 2000 },
    format: {
      type: String,
      enum: ['single-elimination', 'double-elimination', 'round-robin', 'swiss'],
      default: 'single-elimination',
    },
    maxParticipants: { type: Number, required: true, min: 2 },
    organizerName: { type: String, trim: true, maxlength: 120 },
    organizerUser: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    participants: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Participant' }],
    matches: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Match' }],
    status: {
      type: String,
      enum: ['draft', 'registration-open', 'active', 'completed', 'cancelled'],
      default: 'draft',
    },
    startDate: { type: Date },
    endDate: { type: Date },
    defaultRoom: { type: mongoose.Schema.Types.ObjectId, ref: 'Room' },
  },
  {
    timestamps: true,
  }
);

tournamentSchema.index({ status: 1 });

tournamentSchema.pre('validate', function validateDates(next) {
  if (this.startDate && this.endDate && this.endDate < this.startDate) {
    return next(new Error('endDate must be after startDate'));
  }
  return next();
});

const Tournament = mongoose.model('Tournament', tournamentSchema);

export default Tournament;
