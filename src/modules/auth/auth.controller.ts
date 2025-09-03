import { Request, Response } from 'express';
import { AuthService } from './auth.service';

export const AuthController = {
  async register(req: Request, res: Response) {
    const { email, password, displayName } = req.body ?? {};
    if (!email || !password) return res.status(400).json({ error: 'email_and_password_required' });
    try {
      const out = await AuthService.register(email, password, displayName);
      res.status(201).json(out);
    } catch (e: any) {
      if (e.message === 'email_taken') return res.status(409).json({ error: 'email_taken' });
      res.status(500).json({ error: 'server_error' });
    }
  },

  async login(req: Request, res: Response) {
    const { email, password } = req.body ?? {};
    if (!email || !password) return res.status(400).json({ error: 'email_and_password_required' });
    try {
      const out = await AuthService.login(email, password);
      res.json(out);
    } catch (e: any) {
      if (e.message === 'invalid_credentials') return res.status(401).json({ error: 'invalid_credentials' });
      res.status(500).json({ error: 'server_error' });
    }
  },

  async refresh(req: Request, res: Response) {
    const { refreshToken } = req.body ?? {};
    if (!refreshToken) return res.status(400).json({ error: 'refresh_token_required' });
    try {
      const out = await AuthService.refresh(refreshToken);
      res.json(out);
    } catch {
      res.status(401).json({ error: 'invalid_token' });
    }
  },

  async me(req: Request, res: Response) {
    const userId = (req as any).userId as string;
    const me = await AuthService.me(userId);
    res.json(me);
  }
};
