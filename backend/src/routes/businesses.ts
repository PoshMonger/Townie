import { Router } from 'express';
import { getNearby, getById, search, getHotDeals } from '../controllers/businessController';

const router = Router();

router.get('/nearby', getNearby);
router.get('/search', search);
router.get('/hot-deals', getHotDeals);
router.get('/:id', getById);

export default router;
