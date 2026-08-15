import { Router } from 'express';
import {
  generateZaloDailyZNS,
  sendZaloZNSNotification,
  handleZaloChatMessage,
  getZaloConfig,
  updateZaloConfig
} from '../controllers/zaloBot';

const router = Router();

router.get('/daily-zns/:plotId', generateZaloDailyZNS);
router.post('/send-zns', sendZaloZNSNotification);
router.post('/chat', handleZaloChatMessage);
router.get('/config', getZaloConfig);
router.post('/config', updateZaloConfig);

export default router;
