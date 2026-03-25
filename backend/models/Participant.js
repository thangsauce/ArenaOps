import mongoose from 'mongoose';

const participantSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    tournament: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Tournament',
      required: true,
    },
    gamerTag: { type: String, trim: true, maxlength: 60 },
    displayName: { type: String, trim: true, maxlength: 80 },
    email: { type: String, trim: true, lowercase: true, maxlength: 120 },
    seed: { type: Number, min: 1 },
    registrationStatus: {
      type: String,
      enum: ['pending', 'confirmed', 'declined'],
      default: 'pending',
    },
    availabilityStatus: {
      type: String,
      enum: ['unknown', 'available', 'unavailable'],
      default: 'unknown',
    },
    notes: { type: String, trim: true, maxlength: 1000 },
  },
  {
    timestamps: true,
  }
);

participantSchema.index({ tournament: 1, registrationStatus: 1 });
participantSchema.index(
  { tournament: 1, user: 1 },
  {
    unique: true,
    partialFilterExpression: { user: { $type: 'objectId' } },
  }
);

const Participant = mongoose.model('Participant', participantSchema);

export default Participant;
