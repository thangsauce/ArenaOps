import User from '../models/User.js';

export const createUser = async (req, res) => {
  try {
    const user = await User.create(req.body);
    return res.status(201).json(user);
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({ message: 'Email already exists.' });
    }
    return res.status(400).json({ message: error.message });
  }
};
