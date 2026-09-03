import express from 'express';
import * as appointmentController from '../controllers/appointmentController.js';

const router = express.Router();

router.post('/', appointmentController.createAppointment);
router.get('/user/:userId', appointmentController.getUserAppointments);
router.put('/:id/cancel', appointmentController.cancelAppointment);
router.get('/doctor/:doctorId/slots', appointmentController.getAvailableSlots);

export default router;
