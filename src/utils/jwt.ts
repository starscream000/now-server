import jwt from 'jsonwebtoken';
import { env } from '../config/env';

export type JwtPayload = { sub: string; typ: 'access' | 'refresh'; jti?: string };

export function signAccess(userId: string) {
  return jwt.sign({ sub: userId, typ: 'access' } as JwtPayload, env.accessSecret);
}
export function signRefresh(userId: string, jti: string) {
  return jwt.sign({ sub: userId, typ: 'refresh', jti } as JwtPayload, env.refreshSecret);
}
export function verifyAccess(token: string): JwtPayload {
  return jwt.verify(token, env.accessSecret) as JwtPayload;
}
export function verifyRefresh(token: string): JwtPayload {
  return jwt.verify(token, env.refreshSecret) as JwtPayload;
}
