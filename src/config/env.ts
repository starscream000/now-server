import 'dotenv/config';

function req(n: string) {
    const v = process.env[n]; if (!v) throw new Error(`Missing env ${n}`); return v;
}

export const env = {
    port: Number(process.env.PORT ?? 3000),
    dbUrl: req('DATABASE_URL'),
    accessSecret: req('JWT_ACCESS_SECRET'),
    refreshSecret: req('JWT_REFRESH_SECRET'),
    accessTtl: process.env.ACCESS_TTL ?? '15m',
    refreshTtl: process.env.REFRESH_TTL ?? '7d',
};
