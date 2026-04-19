import { Router } from 'express';
import { createSubmission, getMySubmissions } from '../controllers/submissionController';
import { requireAuth } from '../middleware/auth';
import { upload } from '../middleware/upload';

const router = Router();

router.post('/', requireAuth, upload.array('images', 5), createSubmission);
router.get('/mine', requireAuth, getMySubmissions);

export default router;
