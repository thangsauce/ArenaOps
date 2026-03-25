import Notification from '../models/Notification.js';

export const createNotification = async (req, res) => {
  try {
    const notification = await Notification.create(req.body);
    return res.status(201).json(notification);
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
};

export const getNotificationsByUser = async (req, res) => {
  try {
    const notifications = await Notification.find({ user: req.params.userId })
      .sort({ createdAt: -1 })
      .populate('relatedTournament', 'name status')
      .populate('relatedMatch', 'roundLabel status')
      .populate('relatedBooking', 'startTime endTime status');

    return res.status(200).json(notifications);
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
};
