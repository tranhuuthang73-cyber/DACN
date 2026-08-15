import { Router } from 'express';
import {
  generateDailyBriefing,
  sendTelegramMessage,
  handleBotCommand,
  getBotConfig,
  updateBotConfig
} from '../controllers/telegramBot';

const router = Router();

router.get('/daily-briefing/:plotId', generateDailyBriefing);
router.post('/send-alert', sendTelegramMessage);
router.post('/command', handleBotCommand);
router.get('/config', getBotConfig);
router.post('/config', updateBotConfig);

export default router;
