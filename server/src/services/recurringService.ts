import { prisma } from '../db.js';
import { getNextRunDate } from './goalService.js';
import { decimalToNumber } from '../utils/format.js';

export const processDueRecurrences = async () => {
  const now = new Date();
  const due = await prisma.recurringPayment.findMany({
    where: {
      isActive: true,
      nextRunAt: { lte: now },
    },
  });

  for (const rec of due) {
    // Check for start date (double check, though query handles lte now)
    if (rec.startDate && now < rec.startDate) {
      continue; // Should not happen if nextRunAt was set correctly, but safety first
    }

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

      // Check for end date
      let isActive = true;
      if (rec.endDate && nextRunAt > rec.endDate) {
        isActive = false; // Stop recurrence if next run is after end date
      }

      await tx.recurringPayment.update({
        where: { id: rec.id },
        data: {
          lastRunAt: new Date(),
          nextRunAt,
          isActive,
        },
      });
    });
  }

  return due.length;
};
