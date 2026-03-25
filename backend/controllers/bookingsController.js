import Booking from '../models/Booking.js';

export const createBooking = async (req, res) => {
  try {
    const { room, startTime, endTime } = req.body;

    
    const conflictingBooking = await Booking.findOne({
      room,
      status: { $in: ['reserved', 'active'] },
      startTime: { $lt: new Date(endTime) },
      endTime: { $gt: new Date(startTime) },
    });

    if (conflictingBooking) {
      return res.status(409).json({
        message: 'Room is already booked for an overlapping time window.',
        conflictingBookingId: conflictingBooking._id,
      });
    }

    const booking = await Booking.create({
      ...req.body,
      conflictChecked: true,
    });

    return res.status(201).json(booking);
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
};
