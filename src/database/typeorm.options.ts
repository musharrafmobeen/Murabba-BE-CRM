import { User } from '../users/user.entity.js';
import { OtpSession } from '../auth/otp-session.entity.js';

export function typeormOptions() {
  const sslEnabled = process.env.DB_SSL === 'true';

  return {
    type: 'postgres' as const,
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT),
    username: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    entities: [User, OtpSession],
    migrations: ['dist/database/migrations/*.js'],
    synchronize: false,
    ssl: sslEnabled ? { rejectUnauthorized: false } : false,
  };
}
