import { Goal, Transaction, RecurringPayment, GoalWithProgress } from './types';

export const mockGoals: Goal[] = [
  {
    id: '1',
    userId: 'user1',
    name: 'Honda CB 500F',
    targetAmount: 35000,
    currentCash: 8500,
    currentPix: 12300,
    imageUrl: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=300&fit=crop',
    productLink: 'https://www.honda.com.br/motos/cb-500f',
    targetDate: new Date('2025-12-01'),
    safetyMargin: 10,
    createdAt: new Date('2024-01-15'),
    updatedAt: new Date('2025-01-10'),
    isCompleted: false,
  },
  {
    id: '2',
    userId: 'user1',
    name: 'MacBook Pro M3',
    targetAmount: 18000,
    currentCash: 5000,
    currentPix: 9500,
    imageUrl: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=400&h=300&fit=crop',
    productLink: 'https://www.apple.com/br/shop/buy-mac/macbook-pro',
    safetyMargin: 5,
    createdAt: new Date('2024-06-01'),
    updatedAt: new Date('2025-01-14'),
    isCompleted: false,
  },
  {
    id: '3',
    userId: 'user1',
    name: 'Viagem para Portugal',
    targetAmount: 25000,
    currentCash: 2000,
    currentPix: 3000,
    imageUrl: 'https://images.unsplash.com/photo-1555881400-74d7acaacd8b?w=400&h=300&fit=crop',
    targetDate: new Date('2026-06-01'),
    safetyMargin: 15,
    createdAt: new Date('2024-09-01'),
    updatedAt: new Date('2025-01-12'),
    isCompleted: false,
  },
  {
    id: '4',
    userId: 'user1',
    name: 'Fundo de Emergência',
    targetAmount: 10000,
    currentCash: 10000,
    currentPix: 500,
    safetyMargin: 0,
    createdAt: new Date('2024-03-01'),
    updatedAt: new Date('2025-01-01'),
    isCompleted: true,
  },
];

export const mockTransactions: Transaction[] = [
  {
    id: 't1',
    goalId: '1',
    amount: 500,
    type: 'pix',
    category: 'entrada',
    description: 'Salário extra',
    createdAt: new Date('2025-01-10'),
  },
  {
    id: 't2',
    goalId: '1',
    amount: 200,
    type: 'cash',
    category: 'entrada',
    description: 'Freelance',
    createdAt: new Date('2025-01-08'),
  },
  {
    id: 't3',
    goalId: '1',
    amount: 1000,
    type: 'pix',
    category: 'entrada',
    description: 'Décimo terceiro',
    createdAt: new Date('2024-12-20'),
  },
  {
    id: 't4',
    goalId: '2',
    amount: 800,
    type: 'pix',
    category: 'entrada',
    description: 'Bônus trabalho',
    createdAt: new Date('2025-01-14'),
  },
  {
    id: 't5',
    goalId: '2',
    amount: 300,
    type: 'cash',
    category: 'entrada',
    description: 'Venda de itens',
    createdAt: new Date('2025-01-05'),
  },
];

export const mockRecurringPayments: RecurringPayment[] = [
  {
    id: 'r1',
    goalId: '1',
    name: 'Aporte mensal',
    amount: 800,
    type: 'pix',
    category: 'entrada',
    frequency: 'mensal',
    dayOfMonth: 5,
    nextExecution: new Date('2025-02-05'),
    lastExecution: new Date('2025-01-05'),
    isActive: true,
  },
  {
    id: 'r2',
    goalId: '1',
    name: 'Economia semanal',
    amount: 100,
    type: 'cash',
    category: 'entrada',
    frequency: 'semanal',
    dayOfWeek: 5,
    nextExecution: new Date('2025-01-17'),
    lastExecution: new Date('2025-01-10'),
    isActive: true,
  },
  {
    id: 'r3',
    goalId: '2',
    name: 'Reserva mensal',
    amount: 500,
    type: 'pix',
    category: 'entrada',
    frequency: 'mensal',
    dayOfMonth: 10,
    nextExecution: new Date('2025-02-10'),
    lastExecution: new Date('2025-01-10'),
    isActive: true,
  },
];

export const getGoalWithProgress = (goalId: string): GoalWithProgress | null => {
  const goal = mockGoals.find((g) => g.id === goalId);
  if (!goal) return null;

  const transactions = mockTransactions.filter((t) => t.goalId === goalId);
  const recurringPayments = mockRecurringPayments.filter((r) => r.goalId === goalId);
  const totalCurrent = goal.currentCash + goal.currentPix;
  const percentage = Math.min(100, (totalCurrent / goal.targetAmount) * 100);

  return {
    ...goal,
    totalCurrent,
    percentage,
    transactions,
    recurringPayments,
  };
};

export const getAllGoalsWithProgress = (): GoalWithProgress[] => {
  return mockGoals.map((goal) => {
    const transactions = mockTransactions.filter((t) => t.goalId === goal.id);
    const recurringPayments = mockRecurringPayments.filter((r) => r.goalId === goal.id);
    const totalCurrent = goal.currentCash + goal.currentPix;
    const percentage = Math.min(100, (totalCurrent / goal.targetAmount) * 100);

    return {
      ...goal,
      totalCurrent,
      percentage,
      transactions,
      recurringPayments,
    };
  });
};
