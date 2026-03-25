import mongoose from 'mongoose';

const roomSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 80 },
    building: { type: String, trim: true, maxlength: 120 },
    campus: { type: String, trim: true, maxlength: 120 },
    capacity: { type: Number, min: 1, default: 1 },
    setupType: { type: String, trim: true, maxlength: 80 },
    isActive: { type: Boolean, default: true },
    notes: { type: String, trim: true, maxlength: 1000 },
  },
  {
    timestamps: true,
  }
);

roomSchema.index({ name: 1, building: 1, campus: 1 });

const Room = mongoose.model('Room', roomSchema);

export default Room;
