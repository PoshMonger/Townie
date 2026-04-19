import { Router } from 'express';
import {
  getPendingSubmissions,
  reviewSubmission,
  createBusiness,
  updateBusiness,
  deleteBusiness,
  getStats,
} from '../controllers/adminController';
import { requireAdmin } from '../middleware/auth';
import { upload } from '../middleware/upload';

const router = Router();

router.use(requireAdmin);

router.get('/stats', getStats);
router.get('/submissions/pending', getPendingSubmissions);
router.post('/submissions/:id/review', reviewSubmission);
router.post('/businesses', upload.array('images', 10), createBusiness);
router.put('/businesses/:id', updateBusiness);
router.delete('/businesses/:id', deleteBusiness);

export default router;
