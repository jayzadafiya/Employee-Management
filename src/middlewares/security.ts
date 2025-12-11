import helmet from 'helmet';
import cors from 'cors';
import mongoSanitize from 'express-mongo-sanitize';
import { xss } from 'express-xss-sanitizer';
import { Application } from 'express';
import config from '@config/config';

export const setupSecurity = (app: Application): void => {
  app.use(helmet());

  app.use(
    cors({
      origin: config.env === 'production' ? ['https://yourdomain.com'] : '*',
      credentials: true,
    })
  );

  app.use(mongoSanitize());

  app.use(xss());
};
