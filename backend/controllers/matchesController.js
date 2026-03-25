import Match from '../models/Match.js';

export const createMatch = async (req, res) => {
  try {
    const match = await Match.create(req.body);
    return res.status(201).json(match);
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
};

export const getMatchById = async (req, res) => {
  try {
    const match = await Match.findById(req.params.id)
      .populate('participant1 participant2 winner loser', 'gamerTag displayName')
      .populate('room', 'name building campus');

    if (!match) {
      return res.status(404).json({ message: 'Match not found.' });
    }

    return res.status(200).json(match);
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
};
