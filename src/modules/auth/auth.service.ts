import { prisma } from '../../db/prisma';
import bcrypt from 'bcrypt';
import { signAccess, signRefresh } from '../../utils/jwt';

function addDays(d: Date, n: number) {
    const x = new Date(d); x.setDate(x.getDate() + n); return x;
}

export const AuthService = {
    async register(email: string, password: string, displayName?: string) {
        const exists = await prisma.user.findUnique({ where: { email } });
        if (exists) throw new Error('email_taken');
        const hash = await bcrypt.hash(password, 12);
        const user = await prisma.user.create({ data: { email, passwordHash: hash, displayName } });
        const session = await prisma.session.create({
            data: { userId: user.id, refreshJti: crypto.randomUUID(), expiresAt: addDays(new Date(), 7) }
        });
        return {
            accessToken: signAccess(user.id),
            refreshToken: signRefresh(user.id, session.refreshJti),
            user: { id: user.id, email: user.email, displayName: user.displayName }
        };
    },

    async login(email: string, password: string) {
        const user = await prisma.user.findUnique({ where: { email } });
        if (!user) throw new Error('invalid_credentials');
        const ok = await bcrypt.compare(password, user.passwordHash);
        if (!ok) throw new Error('invalid_credentials');
        const session = await prisma.session.create({
            data: { userId: user.id, refreshJti: crypto.randomUUID(), expiresAt: addDays(new Date(), 7) }
        });
        return {
            accessToken: signAccess(user.id),
            refreshToken: signRefresh(user.id, session.refreshJti),
            user: { id: user.id, email: user.email, displayName: user.displayName }
        };
    },

    async refresh(refreshToken: string) {
        const { verifyRefresh } = await import('../../utils/jwt');
        const payload = verifyRefresh(refreshToken);
        if (payload.typ !== 'refresh' || !payload.jti) throw new Error('invalid_token');

        const session = await prisma.session.findUnique({ where: { refreshJti: payload.jti } });
        if (!session || session.revokedAt || session.expiresAt < new Date()) throw new Error('invalid_token');

        await prisma.session.update({ where: { refreshJti: payload.jti }, data: { revokedAt: new Date() } });
        const next = await prisma.session.create({
            data: { userId: session.userId, refreshJti: crypto.randomUUID(), expiresAt: addDays(new Date(), 7) }
        });

        return { accessToken: signAccess(session.userId), refreshToken: signRefresh(session.userId, next.refreshJti) };
    },

    async me(userId: string) {
        return prisma.user.findUnique({ where: { id: userId }, select: { id: true, email: true, displayName: true } });
    }
};
