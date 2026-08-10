import { Router } from 'express';
import { createPlot, getPlots, getPlotById, updatePlot, deletePlot } from '../controllers/plots';
import { authenticate } from '../middleware/auth';

const router = Router();

router.use(authenticate);

router.post('/', createPlot);
router.get('/', getPlots);
router.get('/:id', getPlotById);
router.put('/:id', updatePlot);
router.delete('/:id', deletePlot);

export default router;
