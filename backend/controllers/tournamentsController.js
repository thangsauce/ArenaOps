import Tournament from '../models/Tournament.js';

export const createTournament = async (req, res) => {
  try {
    const tournament = await Tournament.create(req.body);
    return res.status(201).json(tournament);
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
};

export const getTournaments = async (_req, res) => {
  try {
    const tournaments = await Tournament.find()
      .sort({ createdAt: -1 })
      .populate('organizerUser', 'displayName email')
      .populate('defaultRoom', 'name building campus');

    return res.status(200).json(tournaments);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};
