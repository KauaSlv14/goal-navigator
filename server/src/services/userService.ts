import { prisma } from '../db';
import { env } from '../env';

export const ensureDefaultUser = async () => {
  const existing = await prisma.user.findFirst({
    where: { email: env.defaultUserEmail },
  });

  if (existing) return existing;

  return prisma.user.create({
    data: {
      email: env.defaultUserEmail,
      name: env.defaultUserName,
    },
  });
};
