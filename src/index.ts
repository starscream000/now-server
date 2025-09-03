import express from 'express';
import { env } from './config/env';
import { authRouter } from './modules/auth/auth.routes';

const app = express();
app.use(express.json());
app.get('/health', (_req, res) => res.json({ ok: true ,host:`http://localhost:${env.port}`,tree:{health:'/health',v1:{auth:{register:'/v1/auth/register',login:'/v1/auth/login',refresh:'/v1/auth/refresh',me:'/v1/auth/me'}}}}));
app.use('/v1/auth', authRouter);
app.listen(env.port, () => console.log(`api on : http://localhost:${env.port}`));
