import { prisma } from '../db';
import { decimalToNumber, calculateGoalProgress } from '../utils/format';
import { ensureUser } from './userService';
import { TransactionType, TransactionCategory, RecurrenceFrequency } from '../../generated/prisma';

type TransactionInput = {
  amount: number;
  type: TransactionType;
  category: TransactionCategory;
  description?: string;
};

type CreateGoalInput = {
  userEmail: string;
  userName?: string;
  name: string;
  targetAmount: number;
  initialCash: number;
  initialPix: number;
  imageUrl?: string;
  productLink?: string;
  targetDate?: string;
  safetyMargin?: number;
};

export const getGoalsWithProgress = async (userEmail: string, userName?: string) => {
  const user = await ensureUser(userEmail, userName);
  if (!user) throw new Error('USER_NOT_FOUND');

  const goals = await prisma.goal.findMany({
    where: { userId: user.id },
    include: { transactions: true, recurringPayments: true },
    orderBy: { createdAt: 'desc' },
  });

  return goals.map(mapGoalWithProgress);
};

export const createGoal = async (data: CreateGoalInput) => {
  const user = await ensureUser(data.userEmail, data.userName);
  if (!user) throw new Error('USER_NOT_FOUND');

  const goal = await prisma.goal.create({
    data: {
      userId: user.id,
      name: data.name,
      targetAmount: data.targetAmount,
      initialCash: data.initialCash,
      initialPix: data.initialPix,
      imageUrl: data.imageUrl,
      productLink: data.productLink,
      targetDate: data.targetDate ? new Date(data.targetDate) : undefined,
      safetyMargin: data.safetyMargin ?? 0,
    },
  });

  const fullGoal = await prisma.goal.findUnique({
    where: { id: goal.id },
    include: { transactions: true, recurringPayments: true },
  });

  return fullGoal ? mapGoalWithProgress(fullGoal) : null;
};

export const getGoalById = async (id: string, userEmail: string, userName?: string) => {
  const user = await ensureUser(userEmail, userName);
  if (!user) throw new Error('USER_NOT_FOUND');
  const goal = await prisma.goal.findFirst({
    where: { id, userId: user.id },
    include: {
      transactions: { orderBy: { createdAt: 'desc' } },
      recurringPayments: true,
    },
  });

  if (!goal) return null;
  return mapGoalWithProgress(goal);
};

export const addTransactionToGoal = async (goalId: string, userEmail: string, data: TransactionInput, userName?: string) => {
  const user = await ensureUser(userEmail, userName);
  if (!user) throw new Error('USER_NOT_FOUND');
  const goalExists = await prisma.goal.findFirst({ where: { id: goalId, userId: user.id } });
  if (!goalExists) return null;

  const transaction = await prisma.transaction.create({
    data: {
      goalId,
      amount: data.amount,
      type: data.type,
      category: data.category,
      description: data.description,
    },
  });

  return transaction;
};

export const addRecurringPaymentToGoal = async (
  goalId: string,
  data: {
    userEmail: string;
    userName?: string;
    name: string;
    amount: number;
    type: TransactionType;
    category: TransactionCategory;
    frequency: RecurrenceFrequency;
    dayOfMonth?: number;
    dayOfWeek?: number;
    startsAt?: string;
  }
) => {
  const user = await ensureUser(data.userEmail, data.userName);
  if (!user) throw new Error('USER_NOT_FOUND');
  const goalExists = await prisma.goal.findFirst({ where: { id: goalId, userId: user.id } });
  if (!goalExists) return null;

  const nextRunAt = data.startsAt
    ? new Date(data.startsAt)
    : getNextRunDate({
      frequency: data.frequency,
      dayOfMonth: data.dayOfMonth,
      dayOfWeek: data.dayOfWeek,
    });

  return prisma.recurringPayment.create({
    data: {
      goalId,
      name: data.name,
      amount: data.amount,
      type: data.type,
      category: data.category,
      frequency: data.frequency,
      dayOfMonth: data.dayOfMonth,
      dayOfWeek: data.dayOfWeek,
      nextRunAt,
    },
  });
};

export const deleteGoal = async (goalId: string, userEmail: string, userName?: string) => {
  const user = await ensureUser(userEmail, userName);
  if (!user) throw new Error('USER_NOT_FOUND');
  const goalExists = await prisma.goal.findFirst({ where: { id: goalId, userId: user.id } });
  if (!goalExists) return false;

  await prisma.$transaction([
    prisma.transaction.deleteMany({ where: { goalId } }),
    prisma.recurringPayment.deleteMany({ where: { goalId } }),
    prisma.goal.delete({ where: { id: goalId } }),
  ]);

  return true;
};

export const deleteRecurringPayment = async (goalId: string, recurringId: string, userEmail: string, userName?: string) => {
  const user = await ensureUser(userEmail, userName);
  if (!user) throw new Error('USER_NOT_FOUND');

  // Verify goal belongs to user
  const goalExists = await prisma.goal.findFirst({ where: { id: goalId, userId: user.id } });
  if (!goalExists) return false;

  // Verify recurring payment belongs to goal
  const recurringExists = await prisma.recurringPayment.findFirst({ where: { id: recurringId, goalId } });
  if (!recurringExists) return false;

  await prisma.recurringPayment.delete({ where: { id: recurringId } });
  return true;
};

export const getNextRunDate = (opts: {
  frequency: RecurrenceFrequency;
  dayOfMonth?: number;
  dayOfWeek?: number;
}) => {
  const now = new Date();

  if (opts.frequency === 'diario') {
    now.setDate(now.getDate() + 1);
    return now;
  }

  if (opts.frequency === 'semanal') {
    const targetDay = opts.dayOfWeek ?? 1; // default Monday
    const day = now.getDay(); // 0 Sunday
    const diff = (7 + targetDay - day) % 7 || 7;
    now.setDate(now.getDate() + diff);
    return now;
  }

  if (opts.frequency === 'mensal') {
    const targetDay = Math.min(Math.max(opts.dayOfMonth ?? now.getDate(), 1), 28);
    const currentMonth = now.getMonth();
    const tentative = new Date(now.getFullYear(), currentMonth, targetDay);
    if (tentative <= now) {
      return new Date(now.getFullYear(), currentMonth + 1, targetDay);
    }
    return tentative;
  }

  // anual
  const targetDay = Math.min(Math.max(opts.dayOfMonth ?? now.getDate(), 1), 28);
  return new Date(now.getFullYear() + 1, now.getMonth(), targetDay);
};

const mapGoalWithProgress = (goal: any) => {
  const transactions = goal.transactions ?? [];
  const recurringPayments = goal.recurringPayments ?? [];

  const progress = calculateGoalProgress({
    targetAmount: decimalToNumber(goal.targetAmount),
    initialCash: decimalToNumber(goal.initialCash),
    initialPix: decimalToNumber(goal.initialPix),
    transactions: transactions.map((t: any) => ({
      amount: decimalToNumber(t.amount),
      type: t.type,
      category: t.category,
    })),
  });

  return {
    id: goal.id,
    userId: goal.userId,
    name: goal.name,
    targetAmount: decimalToNumber(goal.targetAmount),
    imageUrl: goal.imageUrl ?? undefined,
    productLink: goal.productLink ?? undefined,
    targetDate: goal.targetDate ?? undefined,
    safetyMargin: goal.safetyMargin ?? 0,
    createdAt: goal.createdAt,
    updatedAt: goal.updatedAt,
    isCompleted: progress.isCompleted,
    currentCash: progress.cashBalance,
    currentPix: progress.pixBalance,
    totalCurrent: progress.totalCurrent,
    totalExpenses: progress.totalExpenses,
    percentage: progress.percentage,
    expensePercentage: progress.expensePercentage,
    transactions: transactions.map((t: any) => ({
      id: t.id,
      goalId: t.goalId,
      amount: decimalToNumber(t.amount),
      type: t.type,
      category: t.category,
      description: t.description ?? undefined,
      createdAt: t.createdAt,
    })),
    recurringPayments: recurringPayments.map((r: any) => ({
      id: r.id,
      goalId: r.goalId,
      name: r.name,
      amount: decimalToNumber(r.amount),
      type: r.type,
      category: r.category,
      frequency: r.frequency,
      dayOfMonth: r.dayOfMonth ?? undefined,
      dayOfWeek: r.dayOfWeek ?? undefined,
      nextRunAt: r.nextRunAt,
      lastRunAt: r.lastRunAt ?? undefined,
      isActive: r.isActive,
      createdAt: r.createdAt,
      updatedAt: r.updatedAt,
    })),
  };
};
