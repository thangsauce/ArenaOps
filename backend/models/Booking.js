import mongoose from 'mongoose';

const bookingSchema = new mongoose.Schema(
  {
    room: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Room',
      required: true,
    },
    match: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Match',
      required: true,
    },
    tournament: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Tournament',
      required: true,
    },
    bookedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    startTime: { type: Date, required: true },
    endTime: { type: Date, required: true },
    status: {
      type: String,
      enum: ['reserved', 'active', 'completed', 'cancelled'],
      default: 'reserved',
    },
    conflictChecked: { type: Boolean, default: false },
  },
  {
    timestamps: true,
  }
);

bookingSchema.index({ room: 1, startTime: 1, endTime: 1 });

bookingSchema.pre('validate', function validateWindow(next) {
  if (this.endTime <= this.startTime) {
    return next(new Error('endTime must be after startTime'));
  }
  return next();
});

const Booking = mongoose.model('Booking', bookingSchema);

export default Booking;
