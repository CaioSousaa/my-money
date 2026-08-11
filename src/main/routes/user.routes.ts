import { Router } from 'express';
import { createUserFactory } from '../factories/create-user-factory';
import { authenticateUserFactory } from '../factories/authenticate-user-factory';

const userRoutes = Router();

userRoutes.post('/users', (request, response) => {
  return createUserFactory().handle(request, response);
});

userRoutes.post('/login', (request, response) => {
  return authenticateUserFactory().handle(request, response);
});

export { userRoutes };
