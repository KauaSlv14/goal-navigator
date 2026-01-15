export type TransactionType = 'cash' | 'pix';
export type TransactionCategory = 'entrada' | 'saida';
export type RecurrenceFrequency = 'Diario' | 'semanal' | 'mensal' | 'anual';

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
  percentage: number;
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
}

export interface User {
  id: string;
  email: string;
  name: string;
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

export const formatDate = (date: Date): string => {
  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(date);
};

export const formatDateShort = (date: Date): string => {
  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: 'short',
  }).format(date);
};

export const convertToMonthlyRate = (amount: number, frequency: RecurrenceFrequency): number => {
  switch (frequency) {
    case 'Diario':
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
  recurringPayments: RecurringPayment[]
): Forecast => {
  const monthlyIncome = recurringPayments
    .filter((p) => p.category === 'entrada' && p.isActive)
    .reduce((sum, p) => sum + convertToMonthlyRate(p.amount, p.frequency), 0);

  const monthlyExpenses = recurringPayments
    .filter((p) => p.category === 'saida' && p.isActive)
    .reduce((sum, p) => sum + convertToMonthlyRate(p.amount, p.frequency), 0);

  const monthlyNetIncome = monthlyIncome - monthlyExpenses;
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
