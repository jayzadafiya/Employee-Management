import { Router } from 'express';
import employeeRoutes from '@modules/employee/employee.routes';
import reviewRoutes from '@modules/review/review.routes';
import authRoutes from '@modules/auth/auth.routes';

const router = Router();

router.get('/health', (_req, res) => {
  res.status(200).json({
    success: true,
    message: 'Server is running',
    timestamp: new Date().toISOString(),
  });
});

router.use('/auth', authRoutes);
router.use('/employees', employeeRoutes);
router.use('/reviews', reviewRoutes);

export default router;
