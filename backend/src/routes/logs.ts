import { Router } from 'express';
import { createLog, getLogsBySeason } from '../controllers/logs';
import { authenticate } from '../middleware/auth';

const router = Router();

router.use(authenticate);

router.post('/', createLog);
router.get('/season/:seasonId', getLogsBySeason);

export default router;
