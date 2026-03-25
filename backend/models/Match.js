import mongoose from 'mongoose';

const matchSchema = new mongoose.Schema(
  {
    tournament: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Tournament',
      required: true,
    },
    roundLabel: { type: String, trim: true, maxlength: 80 },
    bracketType: {
      type: String,
      enum: ['winners', 'losers', 'grand-finals', 'round-robin', 'swiss'],
      default: 'winners',
    },
    participant1: { type: mongoose.Schema.Types.ObjectId, ref: 'Participant' },
    participant2: { type: mongoose.Schema.Types.ObjectId, ref: 'Participant' },
    scheduledStart: { type: Date },
    scheduledEnd: { type: Date },
    actualStart: { type: Date },
    actualEnd: { type: Date },
    score1: { type: Number, min: 0, default: 0 },
    score2: { type: Number, min: 0, default: 0 },
    winner: { type: mongoose.Schema.Types.ObjectId, ref: 'Participant' },
    loser: { type: mongoose.Schema.Types.ObjectId, ref: 'Participant' },
    room: { type: mongoose.Schema.Types.ObjectId, ref: 'Room' },
    status: {
      type: String,
      enum: ['scheduled', 'live', 'completed', 'delayed', 'no-show', 'cancelled'],
      default: 'scheduled',
    },
    delayReason: { type: String, trim: true, maxlength: 500 },
    noShowParticipant: { type: mongoose.Schema.Types.ObjectId, ref: 'Participant' },
  },
  {
    timestamps: true,
  }
);

matchSchema.index({ tournament: 1, status: 1 });

matchSchema.pre('validate', function validateDates(next) {
  if (this.scheduledStart && this.scheduledEnd && this.scheduledEnd < this.scheduledStart) {
    return next(new Error('scheduledEnd must be after scheduledStart'));
  }
  if (this.actualStart && this.actualEnd && this.actualEnd < this.actualStart) {
    return next(new Error('actualEnd must be after actualStart'));
  }
  return next();
});

const Match = mongoose.model('Match', matchSchema);

export default Match;
