import express from 'express';
import { upsertAvailability } from '../controllers/availabilityController.js';

const router = express.Router();

router.post('/', upsertAvailability);

export default router;
