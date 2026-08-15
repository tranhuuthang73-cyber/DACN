import { Router } from 'express';
import { getPlotTelemetry, triggerSmartIrrigation } from '../controllers/iot';
import { authenticate } from '../middleware/auth';

const router = Router();

router.use(authenticate);

router.get('/telemetry/:plotId', getPlotTelemetry);
router.post('/irrigate', triggerSmartIrrigation);

export default router;
