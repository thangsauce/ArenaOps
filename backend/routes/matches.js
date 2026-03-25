import express from 'express';
import { createMatch, getMatchById } from '../controllers/matchesController.js';

const router = express.Router();

router.post('/', createMatch);
router.get('/:id', getMatchById);

export default router;
