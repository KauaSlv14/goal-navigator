import { prisma } from '../db';
import { getNextRunDate } from './goalService';
import { decimalToNumber } from '../utils/format';

export const processDueRecurrences = async () => {
  const now = new Date();
  const due = await prisma.recurringPayment.findMany({
    where: {
      isActive: true,
      nextRunAt: { lte: now },
    },
  });

  for (const rec of due) {
    await prisma.$transaction(async (tx) => {
      await tx.transaction.create({
        data: {
          goalId: rec.goalId,
          amount: decimalToNumber(rec.amount),
          type: rec.type,
          category: rec.category,
          description: `Recorrência: ${rec.name}`,
        },
      });

      const nextRunAt = getNextRunDate({
        frequency: rec.frequency,
        dayOfMonth: rec.dayOfMonth ?? undefined,
        dayOfWeek: rec.dayOfWeek ?? undefined,
      });

      await tx.recurringPayment.update({
        where: { id: rec.id },
        data: {
          lastRunAt: new Date(),
          nextRunAt,
        },
      });
    });
  }

  return due.length;
};
