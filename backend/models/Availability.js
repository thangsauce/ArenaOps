import mongoose from 'mongoose';

const availabilitySchema = new mongoose.Schema(
  {
    participant: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Participant',
      required: true,
    },
    tournament: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Tournament',
      required: true,
    },
    match: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Match',
    },
    available: { type: Boolean, required: true },
    responseDate: { type: Date, default: Date.now },
    notes: { type: String, trim: true, maxlength: 1000 },
  },
  {
    timestamps: true,
  }
);

availabilitySchema.index({ participant: 1, tournament: 1, match: 1 }, { unique: true });

const Availability = mongoose.model('Availability', availabilitySchema);

export default Availability;
