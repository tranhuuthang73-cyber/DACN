import { Router } from 'express';
import { analyzePlotLocation } from '../controllers/plotLocationAdvisor';

const router = Router();

router.get('/analyze', analyzePlotLocation);

export default router;
