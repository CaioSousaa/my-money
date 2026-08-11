import express, { Express } from 'express';
import { userRoutes } from '../routes/user.routes';
import { companyRoutes } from '../routes/company.routes';
import { scheduleRoutes } from '../routes/schedule.routes';
import { initializationError } from '../middleware/initialization-error';

export function buildApp(): Express {
  const app = express();

  app.use(express.json());

  app.use(userRoutes);
  app.use(companyRoutes);
  app.use(scheduleRoutes);

  app.use(initializationError);

  return app;
}
