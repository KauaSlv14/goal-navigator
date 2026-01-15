import { PrismaClient } from '../generated/prisma';
import { env } from './env';

export const prisma = new PrismaClient({
  datasourceUrl: env.databaseUrl || undefined,
});
