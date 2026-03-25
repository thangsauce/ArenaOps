import express from 'express';
import { createParticipant } from '../controllers/participantsController.js';

const router = express.Router();

router.post('/', createParticipant);

export default router;
