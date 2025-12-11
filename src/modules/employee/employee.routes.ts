import { Router } from 'express';
import { mockAuth } from '@middlewares/auth';

const router = Router();

router.use(mockAuth);

export default router;
