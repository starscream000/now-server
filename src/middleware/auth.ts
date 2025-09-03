import { Request, Response, NextFunction } from 'express';
import { verifyAccess } from '../utils/jwt';

export function requireAuth(req: Request, res: Response, next: NextFunction) {
  const h = req.headers.authorization;
  if (!h?.startsWith('Bearer ')) return res.status(401).json({ error: 'missing_token' });
  try {
    const p = verifyAccess(h.slice(7));
    (req as any).userId = p.sub;
    next();
  } catch {
    return res.status(401).json({ error: 'invalid_token' });
  }
}
