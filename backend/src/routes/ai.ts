import { Router } from 'express';
import { getRecommendations, submitFeedback, chatWithAI, diagnoseCrop } from '../controllers/ai';
import { authenticate } from '../middleware/auth';

const router = Router();

router.use(authenticate);

router.get('/recommendations/:seasonId', getRecommendations);
router.post('/feedback/:recommendationId', submitFeedback);
router.post('/chat', chatWithAI);
router.post('/diagnose-crop', diagnoseCrop);

export default router;

