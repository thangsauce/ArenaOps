import express from 'express';
import {
  createNotification,
  getNotificationsByUser,
} from '../controllers/notificationsController.js';

const router = express.Router();

router.post('/', createNotification);
router.get('/:userId', getNotificationsByUser);

export default router;
