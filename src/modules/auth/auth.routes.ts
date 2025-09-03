import { Router } from 'express';
import { AuthController } from './auth.controller';
import { requireAuth } from '../../middleware/auth';

export const authRouter = Router();
authRouter.post('/register', AuthController.register);  // optional in prod
authRouter.post('/login',    AuthController.login);
authRouter.post('/refresh',  AuthController.refresh);
authRouter.get('/me',        requireAuth, AuthController.me);
