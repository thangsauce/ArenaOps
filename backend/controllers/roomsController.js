import Room from '../models/Room.js';

export const createRoom = async (req, res) => {
  try {
    const room = await Room.create(req.body);
    return res.status(201).json(room);
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
};

export const getRooms = async (_req, res) => {
  try {
    const rooms = await Room.find().sort({ name: 1 });
    return res.status(200).json(rooms);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};
