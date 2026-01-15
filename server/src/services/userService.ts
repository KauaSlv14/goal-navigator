import { prisma } from '../db';

export const ensureUser = async (email: string, name?: string) => {
  const existing = await prisma.user.findFirst({
    where: { email },
  });

  if (existing) return existing;

  return prisma.user.create({
    data: {
      email,
      name: name || email.split('@')[0] || 'Usuário',
    },
  });
};
