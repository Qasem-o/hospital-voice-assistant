import express from 'express';
import * as aiController from '../controllers/aiController.js';

const router = express.Router();

router.post('/init-chat', aiController.initializeChat);
router.post('/chat', aiController.chatWithAI);
router.post('/appointment', aiController.aiCreateAppointment);
router.get('/doctors', aiController.getDoctorListForAI);
router.delete('/chat/:sessionId', aiController.endChatSession);

export default router;
