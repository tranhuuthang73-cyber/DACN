import { Router } from 'express';
import {
  getNutrientOptimization,
  getMarketIntelligence,
  getClimateRiskAssessment,
  processVoiceCommand,
  getNDVIHealthData,
  getEmergencyAlerts
} from '../controllers/expert';

const router = Router();

router.get('/nutrients/:plotId', getNutrientOptimization);
router.get('/market', getMarketIntelligence);
router.get('/climate-risk/:plotId', getClimateRiskAssessment);
router.post('/voice-command', processVoiceCommand);
router.get('/ndvi/:plotId', getNDVIHealthData);
router.get('/alerts', getEmergencyAlerts);

export default router;
