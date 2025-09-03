import { prisma } from '../../db/prisma';
export const UserService = {
    findByEmail(email: string) {
        return prisma.user.findUnique({ where: { email } });
    },

    create(email: string, passwordHash: string, displayName?: string) {
        return prisma.user.create({ data: { email, passwordHash, displayName } });
    },
};
