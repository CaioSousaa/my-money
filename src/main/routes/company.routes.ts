import { Router } from 'express';
import { ensureAuthenticate } from '../middleware/ensure-authenticate';
import { createCompanyFactory } from '../factories/create-company-factory';
import { findCompanyByUserFactory } from '../factories/find-company-by-user-factory';

const companyRoutes = Router();

companyRoutes.post('/company', ensureAuthenticate, (request, response) => {
  return createCompanyFactory().handle(request, response);
});

companyRoutes.get('/company', ensureAuthenticate, (request, response) => {
  return findCompanyByUserFactory().handle(request, response);
});

export { companyRoutes };
