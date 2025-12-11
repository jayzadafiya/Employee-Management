import express, { Application, Request, Response } from 'express';
import morgan from 'morgan';
import compression from 'compression';
import { setupSecurity } from '@middlewares/security';
import errorHandler from '@middlewares/errorHandler';
import notFound from '@middlewares/notFound';
import routes from './routes';

const app: Application = express();

setupSecurity(app);

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
} else {
  app.use(morgan('combined'));
}

app.use(compression());

app.get('/', (_req: Request, res: Response) => {
  res.status(200).json({
    success: true,
    message: 'Employee Management API',
    version: '1.0.0',
  });
});

app.use('/api', routes);

app.use(notFound);

app.use(errorHandler);

export default app;
