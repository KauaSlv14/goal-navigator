export type TransactionType = 'cash' | 'pix';
export type TransactionCategory = 'entrada' | 'saida';
export type RecurrenceFrequency = 'diario' | 'semanal' | 'mensal' | 'anual';

export interface Transaction {
  id: string;
  goalId: string;
  amount: number;
  type: TransactionType;
  category: TransactionCategory;
  description?: string;
  createdAt: Date;
}

export interface RecurringPayment {
  id: string;
  goalId: string;
  name: string;
  amount: number;
  type: TransactionType;
  category: TransactionCategory;
  frequency: RecurrenceFrequency;
  dayOfMonth?: number;
  dayOfWeek?: number;
  startDate?: Date;
  endDate?: Date;
  nextExecution: Date;
  lastExecution?: Date;
  isActive: boolean;
}

export interface Goal {
  id: string;
  userId: string;
  name: string;
  targetAmount: number;
  currentCash: number;
  currentPix: number;
  imageUrl?: string;
  productLink?: string;
  targetDate?: Date;
  safetyMargin: number;
  createdAt: Date;
  updatedAt: Date;
  isCompleted: boolean;
}

export interface GoalWithProgress extends Goal {
  totalCurrent: number;
  totalExpenses?: number;
  percentage: number;
  expensePercentage?: number;
  transactions: Transaction[];
  recurringPayments: RecurringPayment[];
}

export interface GoalFormData {
  name: string;
  targetAmount: number;
  initialCash: number;
  initialPix: number;
  productLink: string;
  imageUrl: string;
  targetDate: string;
  safetyMargin: number;
}

export interface TransactionFormData {
  amount: number;
  type: TransactionType;
  category: TransactionCategory;
  description: string;
  deductFromTarget?: boolean;
}

export interface RecurringFormData {
  name: string;
  amount: number;
  type: TransactionType;
  category: TransactionCategory;
  frequency: RecurrenceFrequency;
  dayOfMonth?: number;

  dayOfWeek?: number;
  startsAt?: string;
  startDate?: string;
  endDate?: string;
}

export interface User {
  id: string;
  email: string;
  name: string;
}

export interface UserSession {
  id: string;
  email: string;
  name?: string;
  avatarUrl?: string;
  token: string;
}

export interface AuthCredentials {
  email: string;
  password: string;
  name?: string;
}

export interface AuthResponse {
  token: string;
  user: {
    id: string;
    email: string;
    name: string;
    avatarUrl?: string;
  };
}

export interface Forecast {
  optimistic: number;
  probable: number;
  pessimistic: number;
  monthlyNetIncome: number;
}

export const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value);
};

export const formatDate = (date: Date | string): string => {
  const d = typeof date === 'string' ? new Date(date) : date;
  // If midnight UTC, it was likely meant as a pure date. 
  // We add the offset to make it "local" so it doesn't jump back a day in BRT.
  const localDate = new Date(d.getTime() + d.getTimezoneOffset() * 60000);

  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(localDate);
};

export const formatDateShort = (date: Date | string): string => {
  const d = typeof date === 'string' ? new Date(date) : date;
  const localDate = new Date(d.getTime() + d.getTimezoneOffset() * 60000);

  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: 'short',
  }).format(localDate);
};

export const convertToMonthlyRate = (amount: number, frequency: RecurrenceFrequency): number => {
  switch (frequency) {
    case 'diario':
      return amount * 30;
    case 'semanal':
      return amount * 4.345;
    case 'mensal':
      return amount;
    case 'anual':
      return amount / 12;
    default:
      return amount;
  }
};

export const calculateForecast = (
  targetAmount: number,
  currentTotal: number,
  recurringPayments: RecurringPayment[],
  transactions?: Transaction[]
): Forecast => {
  // --- Monthly income/expense from recurring payments ---
  const recurringIncome = recurringPayments
    .filter((p) => p.category === 'entrada' && p.isActive)
    .reduce((sum, p) => sum + convertToMonthlyRate(p.amount, p.frequency), 0);

  const recurringExpenses = recurringPayments
    .filter((p) => p.category === 'saida' && p.isActive)
    .reduce((sum, p) => sum + convertToMonthlyRate(p.amount, p.frequency), 0);

  // --- Monthly income/expense from past transactions (average) ---
  let transactionMonthlyNet = 0;
  if (transactions && transactions.length > 0) {
    const sorted = [...transactions].sort((a, b) =>
      new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
    );
    const firstDate = new Date(sorted[0].createdAt);
    const lastDate = new Date(sorted[sorted.length - 1].createdAt);
    const diffMs = lastDate.getTime() - firstDate.getTime();
    const diffMonths = Math.max(1, diffMs / (1000 * 60 * 60 * 24 * 30));

    const totalIncome = transactions
      .filter((t) => t.category === 'entrada')
      .reduce((sum, t) => sum + t.amount, 0);
    const totalExpense = transactions
      .filter((t) => t.category === 'saida')
      .reduce((sum, t) => sum + t.amount, 0);

    transactionMonthlyNet = (totalIncome - totalExpense) / diffMonths;
  }

  // --- Blended: use recurring as the baseline, but add the transaction
  //     average to capture one-off deposits/withdrawals ---
  const recurringNet = recurringIncome - recurringExpenses;
  // If we have both, blend them; otherwise use whichever is available
  let monthlyNetIncome: number;
  if (recurringPayments.length > 0 && transactions && transactions.length > 1) {
    // Weighted: 60% recurring (predictable) + 40% past transaction average
    monthlyNetIncome = recurringNet * 0.6 + transactionMonthlyNet * 0.4;
  } else if (transactions && transactions.length > 1) {
    monthlyNetIncome = transactionMonthlyNet;
  } else {
    monthlyNetIncome = recurringNet;
  }

  const remaining = targetAmount - currentTotal;

  if (monthlyNetIncome <= 0) {
    return {
      optimistic: Infinity,
      probable: Infinity,
      pessimistic: Infinity,
      monthlyNetIncome,
    };
  }

  const optimistic = remaining / monthlyNetIncome;
  const probable = remaining / (monthlyNetIncome * 0.9);
  const pessimistic = remaining / (monthlyNetIncome * 0.75);

  return {
    optimistic: Math.ceil(optimistic),
    probable: Math.ceil(probable),
    pessimistic: Math.ceil(pessimistic),
    monthlyNetIncome,
  };
};

export const frequencyLabels: Record<RecurrenceFrequency, string> = {
  diario: 'Diario',
  semanal: 'Semanal',
  mensal: 'Mensal',
  anual: 'Anual',
};
