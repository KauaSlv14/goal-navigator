import 'dotenv/config';

export const env = {
  port: Number(process.env.PORT) || 3333,
  databaseUrl: process.env.DATABASE_URL ?? '',
  corsOrigin: process.env.CORS_ORIGIN ?? '*',
  defaultUserEmail: process.env.DEFAULT_USER_EMAIL ?? 'demo@goal.local',
  defaultUserName: process.env.DEFAULT_USER_NAME ?? 'Usuário Demo',
};
