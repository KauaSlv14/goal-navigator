import { Decimal } from '@prisma/client/runtime/library';

export const decimalToNumber = (value: Decimal | number | null | undefined): number => {
  if (value === null || value === undefined) return 0;
  if (typeof value === 'number') return value;
  return Number(value.toString());
};

export const calculateGoalProgress = (params: {
  targetAmount: number;
  initialCash: number;
  initialPix: number;
  transactions: { amount: number; type: 'cash' | 'pix'; category: 'entrada' | 'saida' }[];
}) => {
  const cashTransactions = params.transactions.filter((t) => t.type === 'cash');
  const pixTransactions = params.transactions.filter((t) => t.type === 'pix');

  const cashBalance =
    params.initialCash +
    cashTransactions.reduce(
      (sum, tx) => sum + (tx.category === 'entrada' ? tx.amount : -tx.amount),
      0
    );

  const pixBalance =
    params.initialPix +
    pixTransactions.reduce(
      (sum, tx) => sum + (tx.category === 'entrada' ? tx.amount : -tx.amount),
      0
    );

  const totalCurrent = cashBalance + pixBalance;
  const percentage = params.targetAmount > 0 ? Math.min(100, (totalCurrent / params.targetAmount) * 100) : 0;
  const isCompleted = percentage >= 100;

  return {
    cashBalance,
    pixBalance,
    totalCurrent,
    percentage,
    isCompleted,
  };
};
