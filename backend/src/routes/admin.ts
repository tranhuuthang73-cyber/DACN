import { Router } from 'express';
import { getUsers, getModelUpdates, updateUserRole } from '../controllers/admin';
import { authenticate } from '../middleware/auth';

const router = Router();

router.use(authenticate);

router.get('/users', getUsers);
router.get('/model-updates', getModelUpdates);
router.put('/users/:id/role', updateUserRole);

export default router;
