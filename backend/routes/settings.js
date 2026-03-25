import express from 'express';
import {
  getUserSettings,
  updateUserSettings,
} from '../controllers/settingsController.js';

const router = express.Router();

router.get('/:userId', getUserSettings);
router.patch('/:userId', updateUserSettings);

export default router;
