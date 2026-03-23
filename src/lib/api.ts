import {
  GoalWithProgress,
  RecurringFormData,
  RecurringPayment,
  TransactionFormData,
  GoalFormData,
  UserSession,
  AuthResponse,
  AuthCredentials,
} from './types';

// In development, use VITE_API_URL (e.g., http://localhost:3333)
// In production (Vercel), use relative paths (empty string, so /api/... works)
const isDev = import.meta.env.DEV;
export const API_URL = isDev
  ? (import.meta.env.VITE_API_URL || 'http://localhost:3333')
  : '';

interface ApiTransaction {
  id: string;
  goalId: string;
  amount: number;
  type: 'cash' | 'pix';
  category: 'entrada' | 'saida';
  description?: string;
  createdAt: string;
}

interface ApiRecurring {
  id: string;
  goalId: string;
  name: string;
  amount: number;
  type: 'cash' | 'pix';
  category: 'entrada' | 'saida';
  frequency: RecurringFormData['frequency'];
  dayOfMonth?: number;
  dayOfWeek?: number;
  nextRunAt: string;
  lastRunAt?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

interface ApiGoal {
  id: string;
  userId: string;
  name: string;
  targetAmount: number;
  imageUrl?: string;
  productLink?: string;
  targetDate?: string;
  safetyMargin: number;
  createdAt: string;
  updatedAt: string;
  isCompleted: boolean;
  currentCash: number;
  currentPix: number;
  totalCurrent: number;
  totalExpenses?: number;
  percentage: number;
  expensePercentage?: number;
  transactions?: ApiTransaction[];
  recurringPayments?: ApiRecurring[];
}

const handleResponse = async (res: Response) => {
  if (!res.ok) {
    let message = 'Erro na requisição';
    try {
      const data = await res.json();
      message = data?.error || data?.message || res.statusText || message;
    } catch (e) {
      // Se não conseguir parsear JSON, usa statusText
      message = res.statusText || message;
    }
    const error = new Error(message);
    (error as any).status = res.status;
    throw error;
  }
  try {
    return await res.json();
  } catch (e) {
    throw new Error('Erro ao processar resposta do servidor');
  }
};

const handleFetch = async (url: string, options?: RequestInit) => {
  try {
    const res = await fetch(url, options);
    return handleResponse(res);
  } catch (error: any) {
    // Network error
    if (error.message.includes('Failed to fetch')) {
      throw new Error('Erro de conexão. Verifique sua internet e tente novamente.');
    }
    // Offline
    if (!navigator.onLine) {
      throw new Error('Você está offline. Verifique sua conexão de internet.');
    }
    // Re-throw the error as is
    throw error;
  }
};

const mapRecurring = (rec: ApiRecurring): RecurringPayment => ({
  id: rec.id,
  goalId: rec.goalId,
  name: rec.name,
  amount: rec.amount,
  type: rec.type,
  category: rec.category,
  frequency: rec.frequency,
  dayOfMonth: rec.dayOfMonth,
  dayOfWeek: rec.dayOfWeek,
  nextExecution: new Date(rec.nextRunAt),
  lastExecution: rec.lastRunAt ? new Date(rec.lastRunAt) : undefined,
  isActive: rec.isActive,
});

const mapGoal = (goal: ApiGoal): GoalWithProgress => ({
  id: goal.id,
  userId: goal.userId,
  name: goal.name,
  targetAmount: goal.targetAmount,
  currentCash: goal.currentCash,
  currentPix: goal.currentPix,
  imageUrl: goal.imageUrl,
  productLink: goal.productLink,
  targetDate: goal.targetDate ? new Date(goal.targetDate) : undefined,
  safetyMargin: goal.safetyMargin,
  createdAt: new Date(goal.createdAt),
  updatedAt: new Date(goal.updatedAt),
  isCompleted: goal.isCompleted,
  totalCurrent: goal.totalCurrent,
  totalExpenses: goal.totalExpenses,
  percentage: goal.percentage,
  expensePercentage: goal.expensePercentage,
  transactions:
    goal.transactions?.map((t) => ({
      id: t.id,
      goalId: t.goalId,
      amount: t.amount,
      type: t.type,
      category: t.category,
      description: t.description,
      createdAt: new Date(t.createdAt),
    })) ?? [],
  recurringPayments: goal.recurringPayments?.map(mapRecurring) ?? [],
});

const authHeaders = (token?: string) =>
  token
    ? {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    }
    : { 'Content-Type': 'application/json' };

export const register = async (data: AuthCredentials): Promise<AuthResponse> => {
  return handleFetch(`${API_URL}/api/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
};

export const login = async (data: AuthCredentials): Promise<AuthResponse> => {
  return handleFetch(`${API_URL}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
};

export const updateProfile = async (
  data: { name?: string; avatarFile?: File | null; removeAvatar?: boolean },
  user: UserSession
): Promise<AuthResponse> => {
  const formData = new FormData();
  if (data.name) formData.append('name', data.name);
  if (data.avatarFile) formData.append('avatar', data.avatarFile);
  if (data.removeAvatar) formData.append('removeAvatar', 'true');

  const res = await fetch(`${API_URL}/api/auth/profile`, {
    method: 'PUT',
    headers: {
      Authorization: `Bearer ${user.token}`,
    },
    body: formData,
  });
  return handleResponse(res);
};

export const getGoals = async (user: UserSession): Promise<GoalWithProgress[]> => {
  const res = await fetch(`${API_URL}/api/goals`, {
    headers: authHeaders(user.token),
  });
  const data: ApiGoal[] = await handleResponse(res);
  return data.map(mapGoal);
};

export const createGoal = async (payload: GoalFormData, user: UserSession): Promise<GoalWithProgress> => {
  const res = await fetch(`${API_URL}/api/goals`, {
    method: 'POST',
    headers: authHeaders(user.token),
    body: JSON.stringify({
      ...payload,
      productLink: payload.productLink || undefined,
      imageUrl: payload.imageUrl || undefined,
      targetDate: payload.targetDate || undefined,
    }),
  });
  const data: ApiGoal = await handleResponse(res);
  return mapGoal(data);
};

export const getGoalDetails = async (id: string, user: UserSession): Promise<GoalWithProgress> => {
  const res = await fetch(`${API_URL}/api/goals/${id}`, {
    headers: authHeaders(user.token),
  });
  const data: ApiGoal = await handleResponse(res);
  return mapGoal(data);
};

export const createTransaction = async (goalId: string, payload: TransactionFormData, user: UserSession) => {
  const res = await fetch(`${API_URL}/api/goals/${goalId}/transactions`, {
    method: 'POST',
    headers: authHeaders(user.token),
    body: JSON.stringify(payload),
  });
  await handleResponse(res);
};

export const createRecurringPayment = async (goalId: string, data: RecurringFormData, user: UserSession): Promise<any> => {
  const response = await fetch(`${API_URL}/api/goals/${goalId}/recurring`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${user.token}`,
    },
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    const err = await response.json();
    throw new Error(err.error || 'Não foi possível criar a recorrência');
  }
  return response.json();
};

export const updateTransaction = async (
  goalId: string,
  transactionId: string,
  data: Partial<TransactionFormData>,
  user: UserSession
): Promise<any> => {
  const response = await fetch(`${API_URL}/api/goals/${goalId}/transactions/${transactionId}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${user.token}`,
    },
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    const err = await response.json();
    throw new Error(err.error || 'Não foi possível atualizar a transação');
  }
  return response.json();
};

export const deleteTransaction = async (goalId: string, transactionId: string, user: UserSession): Promise<any> => {
  const response = await fetch(`${API_URL}/api/goals/${goalId}/transactions/${transactionId}`, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${user.token}`,
    },
    body: JSON.stringify({}),
  });
  if (!response.ok) {
    const err = await response.json();
    throw new Error(err.error || 'Não foi possível deletar a transação');
  }
  return response.json();
};

export const updateRecurringPayment = async (
  goalId: string,
  recurringId: string,
  data: Partial<RecurringFormData>,
  user: UserSession
): Promise<any> => {
  const response = await fetch(`${API_URL}/api/goals/${goalId}/recurring/${recurringId}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${user.token}`,
    },
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    const err = await response.json();
    throw new Error(err.error || 'Não foi possível atualizar a recorrência');
  }
  return response.json();
};

export const runRecurringNow = async () => {
  const res = await fetch(`${API_URL}/api/recurring/run`, { method: 'POST' });
  return handleResponse(res);
};

export interface Friend {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string | null;
}

export const addFriend = async (email: string, user: UserSession): Promise<Friend> => {
  const res = await fetch(`${API_URL}/api/friends`, {
    method: 'POST',
    headers: authHeaders(user.token),
    body: JSON.stringify({ email }),
  });
  const data = await handleResponse(res);
  return data.friend; // Backend returns the friendship object which contains 'friend'
};

export const getFriends = async (user: UserSession): Promise<Friend[]> => {
  const res = await fetch(`${API_URL}/api/friends`, {
    headers: authHeaders(user.token),
  });
  return handleResponse(res);
};

export const getFriendGoals = async (friendId: string, user: UserSession): Promise<GoalWithProgress[]> => {
  const res = await fetch(`${API_URL}/api/friends/${friendId}/goals`, {
    headers: authHeaders(user.token),
  });
  const data: ApiGoal[] = await handleResponse(res);
  return data.map(mapGoal);
};

export interface FriendRequest {
  id: string;
  sender?: Friend;
  friend?: Friend;
  createdAt: string;
}

export const getFriendRequests = async (user: UserSession): Promise<FriendRequest[]> => {
  const res = await fetch(`${API_URL}/api/friends/requests`, {
    headers: authHeaders(user.token),
  });
  return handleResponse(res);
};

export const getSentRequests = async (user: UserSession): Promise<FriendRequest[]> => {
  const res = await fetch(`${API_URL}/api/friends/requests/sent`, {
    headers: authHeaders(user.token),
  });
  return handleResponse(res);
};

export const acceptFriendRequest = async (requestId: string, user: UserSession) => {
  const res = await fetch(`${API_URL}/api/friends/requests/${requestId}/accept`, {
    method: 'POST',
    headers: authHeaders(user.token),
    body: JSON.stringify({}), // Fastify requires body when content-type is application/json
  });
  await handleResponse(res);
};

export const rejectFriendRequest = async (requestId: string, user: UserSession) => {
  const res = await fetch(`${API_URL}/api/friends/requests/${requestId}`, {
    method: 'DELETE',
    headers: authHeaders(user.token),
    body: JSON.stringify({}), // Fastify requires body when content-type is application/json
  });
  await handleResponse(res);
};

export const removeFriend = async (friendId: string, user: UserSession) => {
  const res = await fetch(`${API_URL}/api/friends/${friendId}`, {
    method: 'DELETE',
    headers: authHeaders(user.token),
    body: JSON.stringify({}), // Required by Fastify when Content-Type is application/json
  });
  await handleResponse(res);
};

export const deleteGoal = async (goalId: string, user: UserSession) => {
  const res = await fetch(`${API_URL}/api/goals/${goalId}`, {
    method: 'DELETE',
    headers: authHeaders(user.token),
    body: JSON.stringify({}),
  });
  await handleResponse(res);
};

export const deleteRecurringPayment = async (goalId: string, recurringId: string, user: UserSession) => {
  const res = await fetch(`${API_URL}/api/goals/${goalId}/recurring/${recurringId}`, {
    method: 'DELETE',
    headers: authHeaders(user.token),
    body: JSON.stringify({}),
  });
  await handleResponse(res);
};
