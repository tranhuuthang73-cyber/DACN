import { Router } from 'express';
import { createSeason, getSeasons, updateSeason } from '../controllers/seasons';
import { authenticate } from '../middleware/auth';

const router = Router();

router.use(authenticate);

router.post('/', createSeason);
router.get('/plot/:plotId', getSeasons);
router.put('/:id', updateSeason);

export default router;
