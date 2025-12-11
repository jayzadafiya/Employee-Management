import { Router } from 'express';
import { mockAuth } from '@middlewares/auth';
import * as employeeController from './employee.controller';

const router = Router();

router.use(mockAuth);

router.get('/', employeeController.getEmployees);

export default router;
