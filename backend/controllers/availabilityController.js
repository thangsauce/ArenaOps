import Availability from '../models/Availability.js';

export const upsertAvailability = async (req, res) => {
  try {
    const { participant, tournament, match, available, notes } = req.body;

    const availability = await Availability.findOneAndUpdate(
      { participant, tournament, match: match || null },
      {
        participant,
        tournament,
        match: match || null,
        available,
        notes,
        responseDate: new Date(),
      },
      { new: true, upsert: true, runValidators: true }
    );

    return res.status(200).json(availability);
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
};
