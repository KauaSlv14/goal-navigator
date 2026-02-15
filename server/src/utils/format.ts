export const decimalToNumber = (value: any): number => {
  if (value === null || value === undefined) return 0;
  if (typeof value === 'number') return value;
  // Prisma Decimal.js instances
  if (typeof value === 'object' && typeof value.toNumber === 'function') {
    return value.toNumber();
  }
  if (typeof value === 'object' && typeof value.toString === 'function') {
    return Number(value.toString());
  }
  return Number(value) || 0;
};

export const calculateGoalProgress = (params: {
  targetAmount: number | any;
  initialCash: number | any;
  initialPix: number | any;
  transactions: { amount: number | any; type: 'cash' | 'pix'; category: 'entrada' | 'saida' }[];
}) => {
  const targetAmount = decimalToNumber(params.targetAmount);
  const initialCash = decimalToNumber(params.initialCash);
  const initialPix = decimalToNumber(params.initialPix);

  const cashTransactions = params.transactions.filter((t) => t.type === 'cash');
  const pixTransactions = params.transactions.filter((t) => t.type === 'pix');

  const cashBalance =
    initialCash +
    cashTransactions.reduce(
      (sum, tx) => sum + (tx.category === 'entrada' ? decimalToNumber(tx.amount) : -decimalToNumber(tx.amount)),
      0
    );

  const pixBalance =
    initialPix +
    pixTransactions.reduce(
      (sum, tx) => sum + (tx.category === 'entrada' ? decimalToNumber(tx.amount) : -decimalToNumber(tx.amount)),
      0
    );

  const totalExpenses = params.transactions
    .filter((t) => t.category === 'saida')
    .reduce((sum, tx) => sum + decimalToNumber(tx.amount), 0);

  const totalCurrent = cashBalance + pixBalance;

  // Percentage of net progress
  const percentage = targetAmount > 0 ? Math.min(100, Math.max(0, (totalCurrent / targetAmount) * 100)) : 0;

  // Percentage of expenses relative to target
  const expensePercentage = targetAmount > 0 ? Math.min(100, (totalExpenses / targetAmount) * 100) : 0;

  const isCompleted = percentage >= 100;

  return {
    cashBalance,
    pixBalance,
    totalCurrent,
    totalExpenses,
    percentage,
    expensePercentage,
    isCompleted,
  };
};
