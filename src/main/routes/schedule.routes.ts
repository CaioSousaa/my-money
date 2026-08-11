import { Router } from 'express';
import { ensureAuthenticate } from '../middleware/ensure-authenticate';
import { createScheduleFactory } from '../factories/create-schedule-factory';
import { listSchedulesFactory } from '../factories/list-schedules-factory';
import { getEarningsFactory } from '../factories/get-earnings-factory';

const scheduleRoutes = Router();

scheduleRoutes.post('/schedule', ensureAuthenticate, (request, response) => {
  return createScheduleFactory().handle(request, response);
});

scheduleRoutes.get('/schedule', ensureAuthenticate, (request, response) => {
  return listSchedulesFactory().handle(request, response);
});

scheduleRoutes.get('/earnings', ensureAuthenticate, (request, response) => {
  return getEarningsFactory().handle(request, response);
});

export { scheduleRoutes };
