import { Router } from 'express';
import {
  getCropFarmingMemory,
  getCropGrowthTracker,
  recordBiometricMeasurement
} from '../controllers/cropTracker';

const router = Router();

router.get('/memory/:plotId', getCropFarmingMemory);
router.get('/growth/:seasonId', getCropGrowthTracker);
router.post('/measurements', recordBiometricMeasurement);

export default router;
