import express from 'express';
import { createRoom, getRooms } from '../controllers/roomsController.js';

const router = express.Router();

router.post('/', createRoom);
router.get('/', getRooms);

export default router;
