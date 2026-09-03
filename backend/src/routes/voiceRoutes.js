import express from 'express';
import * as voiceController from '../controllers/voiceController.js';

const router = express.Router();

router.post('/transcribe', voiceController.transcribeAudio);
router.post('/synthesize', voiceController.synthesizeText);
router.post('/voice-booking', voiceController.createAppointmentViaVoice);
router.post('/call-webhook', voiceController.handleCallWebhook);
router.post('/voice-webhook', voiceController.handleVoiceWebhook);
router.post('/initiate-call', voiceController.initiatePhoneCall);

export default router;
