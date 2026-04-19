import { Router } from 'express';
import { getDealsForBusiness, createDeal, updateDeal, deleteDeal } from '../controllers/dealController';
import { requireAdmin } from '../middleware/auth';

const router = Router();

router.get('/business/:businessId', getDealsForBusiness);
router.post('/', requireAdmin, createDeal);
router.put('/:id', requireAdmin, updateDeal);
router.delete('/:id', requireAdmin, deleteDeal);

export default router;
