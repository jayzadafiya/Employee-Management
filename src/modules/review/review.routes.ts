import { Router } from 'express';
import { mockAuth } from '@middlewares/auth';
import * as reviewController from './review.controller';

const router = Router();

router.use(mockAuth);

router.get('/top-performers', reviewController.getTopPerformers);

export default router;
