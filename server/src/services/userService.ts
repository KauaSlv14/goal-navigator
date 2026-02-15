import { prisma } from '../db.js';

export const ensureUser = async (email: string, name?: string) => {
  const existing = await prisma.user.findFirst({
    where: { email },
  });

  if (existing) return existing;
  return null;
};
