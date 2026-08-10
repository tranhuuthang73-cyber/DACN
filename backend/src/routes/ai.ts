import { Router } from 'express';
import { getRecommendations, submitFeedback } from '../controllers/ai';
import { authenticate } from '../middleware/auth';

const router = Router();

router.use(authenticate);

router.get('/recommendations/:seasonId', getRecommendations);
router.post('/feedback/:recommendationId', submitFeedback);

export default router;
