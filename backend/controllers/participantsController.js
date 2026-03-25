import Participant from '../models/Participant.js';

export const createParticipant = async (req, res) => {
  try {
    const participant = await Participant.create(req.body);
    return res.status(201).json(participant);
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
};
