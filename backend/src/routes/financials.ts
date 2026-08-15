import { Router } from 'express';
import { getFinancialSummary } from '../controllers/financials';
import { authenticate } from '../middleware/auth';

const router = Router();

router.use(authenticate);
router.get('/summary', getFinancialSummary);

export default router;
