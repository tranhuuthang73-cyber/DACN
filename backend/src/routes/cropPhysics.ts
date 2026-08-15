import { Router } from 'express';
import {
  getVPDMetrics,
  getFAO56Evapotranspiration,
  getParetoOptimizationScenarios
} from '../controllers/cropPhysics';

const router = Router();

router.get('/vpd/:plotId', getVPDMetrics);
router.get('/fao56/:plotId', getFAO56Evapotranspiration);
router.get('/pareto/:plotId', getParetoOptimizationScenarios);

export default router;
