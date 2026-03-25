import express from 'express';
import { createBooking } from '../controllers/bookingsController.js';

const router = express.Router();

router.post('/', createBooking);

export default router;
