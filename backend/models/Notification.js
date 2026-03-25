import mongoose from 'mongoose';

const notificationSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    type: {
      type: String,
      enum: [
        'match-start',
        'delay',
        'no-show',
        'room-change',
        'participant-update',
        'tournament-update',
      ],
      required: true,
    },
    title: { type: String, required: true, trim: true, maxlength: 140 },
    message: { type: String, required: true, trim: true, maxlength: 2000 },
    isRead: { type: Boolean, default: false },
    relatedTournament: { type: mongoose.Schema.Types.ObjectId, ref: 'Tournament' },
    relatedMatch: { type: mongoose.Schema.Types.ObjectId, ref: 'Match' },
    relatedBooking: { type: mongoose.Schema.Types.ObjectId, ref: 'Booking' },
  },
  {
    timestamps: true,
  }
);

notificationSchema.index({ user: 1, isRead: 1 });

const Notification = mongoose.model('Notification', notificationSchema);

export default Notification;
