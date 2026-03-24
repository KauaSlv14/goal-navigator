import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ProgressBar } from '@/components/ProgressBar';
import { TransactionItem } from '@/components/TransactionItem';
import { RecurringPaymentItem } from '@/components/RecurringPaymentItem';
import { ForecastCard } from '@/components/ForecastCard';
import { AddTransactionModal } from '@/components/AddTransactionModal';
import { CelebrationModal } from '@/components/CelebrationModal';
import {
  GoalWithProgress,
  TransactionFormData,
  RecurringFormData,
  calculateForecast,
  formatCurrency,
  formatDate,
  UserSession,
} from '@/lib/types';
import {
  ArrowLeft,
  Target,
  ExternalLink,
  Calendar,
  Banknote,
  Smartphone,
  Plus,
  History,
  RepeatIcon,
  Edit,
  Trash2,
  Globe,
  Lock
} from 'lucide-react';
import { toast } from 'sonner';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ThemeToggle } from '@/components/ThemeToggle';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  createRecurringPayment,
  createTransaction,
  deleteGoal as deleteGoalApi,
  getGoalDetails,
  deleteRecurringPayment,
  updateTransaction,
  deleteTransaction,
  updateRecurringPayment,
  updateGoalVisibility
} from '@/lib/api';
import { AddRecurringModal } from '@/components/AddRecurringModal';

export const GoalDetails = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const storedUser = localStorage.getItem('user');
  const user: UserSession | null = storedUser ? JSON.parse(storedUser) : null;

  const [goal, setGoal] = useState<GoalWithProgress | null>(null);
  const [isTransactionModalOpen, setIsTransactionModalOpen] = useState(false);
  const [isRecurringModalOpen, setIsRecurringModalOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<any | null>(null);
  const [editingRecurring, setEditingRecurring] = useState<any | null>(null);
  const [showCelebration, setShowCelebration] = useState(false);

  useEffect(() => {
    if (!user?.email || !user?.token) {
      navigate('/auth');
    }
  }, [user?.email, user?.token, navigate]);

  const goalQuery = useQuery({
    queryKey: ['goal', id, user?.email],
    queryFn: () => getGoalDetails(id!, user as UserSession),
    enabled: !!id && !!user?.email && !!user?.token,
    retry: false,
  });

  useEffect(() => {
    if (goalQuery.data) {
      setGoal(goalQuery.data as GoalWithProgress);
    }
  }, [goalQuery.data]);

  useEffect(() => {
    if (goalQuery.isError) {
      toast.error('Meta não encontrada');
      navigate('/dashboard');
    }
  }, [goalQuery.isError, navigate]);

  const transactionMutation = useMutation({
    mutationFn: (payload: TransactionFormData) => {
      if (editingTransaction) {
        return updateTransaction(id!, editingTransaction.id, payload, user as UserSession);
      }
      return createTransaction(id!, payload, user as UserSession);
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['goal', id, user?.email] });
      const updated = await queryClient.fetchQuery({
        queryKey: ['goal', id, user?.email],
        queryFn: () => getGoalDetails(id!, user as UserSession),
      });
      setGoal(updated);
      setIsTransactionModalOpen(false);
      setEditingTransaction(null);
      if (!goal?.isCompleted && updated.isCompleted) {
        setTimeout(() => setShowCelebration(true), 500);
      }
    },
    onError: (err: any) => toast.error(err?.message ?? 'Não foi possível registrar a transação'),
  });

  const recurringMutation = useMutation({
    mutationFn: (payload: RecurringFormData) => {
      if (editingRecurring) {
        return updateRecurringPayment(id!, editingRecurring.id, payload, user as UserSession);
      }
      return createRecurringPayment(id!, payload, user as UserSession);
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['goal', id, user?.email] });
      const updated = await queryClient.fetchQuery({
        queryKey: ['goal', id, user?.email],
        queryFn: () => getGoalDetails(id!, user as UserSession),
      });
      setGoal(updated);
      setIsRecurringModalOpen(false);
      setEditingRecurring(null);
      toast.success(editingRecurring ? 'Recorrência atualizada!' : 'Recorrência criada!');
    },
    onError: (err: any) => toast.error(err?.message ?? 'Não foi possível salvar a recorrência'),
  });

  const deleteTransactionMutation = useMutation({
    mutationFn: (transactionId: string) => deleteTransaction(id!, transactionId, user as UserSession),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['goal', id, user?.email] });
      const updated = await queryClient.fetchQuery({
        queryKey: ['goal', id, user?.email],
        queryFn: () => getGoalDetails(id!, user as UserSession),
      });
      setGoal(updated);
      toast.success('Transação removida!');
    },
    onError: (err: any) => toast.error(err?.message ?? 'Não foi possível remover a transação'),
  });

  const deleteRecurringMutation = useMutation({
    mutationFn: (recurringId: string) => deleteRecurringPayment(id!, recurringId, user as UserSession),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['goal', id, user?.email] });
      const updated = await queryClient.fetchQuery({
        queryKey: ['goal', id, user?.email],
        queryFn: () => getGoalDetails(id!, user as UserSession),
      });
      setGoal(updated);
      toast.success('Recorrência removida!');
    },
    onError: (err: any) => toast.error(err?.message ?? 'Não foi possível remover a recorrência'),
  });

  useEffect(() => {
    if (goalQuery.data) {
      setGoal(goalQuery.data);
    }
  }, [goalQuery.data]);

  const deleteGoalMutation = useMutation({
    mutationFn: () => deleteGoalApi(id!, user as UserSession),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['goals', user?.email] });
      toast.success('Meta excluída com sucesso');
      navigate('/dashboard');
    },
    onError: (err: any) => toast.error(err?.message ?? 'Não foi possível excluir a meta'),
  });

  const toggleVisibilityMutation = useMutation({
    mutationFn: (newVisibility: boolean) => updateGoalVisibility(id!, newVisibility, user as UserSession),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['goal', id, user?.email] });
      await queryClient.invalidateQueries({ queryKey: ['goals', user?.email] });

      const updated = await queryClient.fetchQuery({
        queryKey: ['goal', id, user?.email],
        queryFn: () => getGoalDetails(id!, user as UserSession),
      });
      setGoal(updated);
      toast.success(`Meta agora é ${updated.isPublic ? 'Pública' : 'Privada'}!`);
    },
    onError: (err: any) => toast.error(err?.message ?? 'Não foi possível alterar a visibilidade'),
  });

  if (goalQuery.isLoading || !goal) {
    return (
      <div className="min-h-[100dvh] bg-background flex items-center justify-center">
        <div className="animate-pulse flex items-center gap-2">
          <Target className="w-6 h-6 text-primary" />
          <span className="text-muted-foreground">Carregando...</span>
        </div>
      </div>
    );
  }

  const forecast = calculateForecast(
    goal.targetAmount,
    goal.totalCurrent,
    goal.recurringPayments,
    goal.transactions
  );

  const remaining = goal.targetAmount - goal.totalCurrent;

  const handleAddTransaction = async (data: TransactionFormData) => {
    await transactionMutation.mutateAsync(data);
  };

  const handleAddRecurring = async (data: RecurringFormData) => {
    await recurringMutation.mutateAsync(data);
  };

  const handleDelete = async () => {
    if (confirm('Tem certeza que deseja excluir esta meta?')) {
      await deleteGoalMutation.mutateAsync();
    }
  };

  return (
    <div className="min-h-[100dvh] bg-background">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-background/80 backdrop-blur-lg border-b border-border pt-[env(safe-area-inset-top)]">
        <div className="container max-w-2xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <button
              onClick={() => navigate('/dashboard')}
              className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              <span className="font-medium">Voltar</span>
            </button>
            <div className="flex items-center gap-2">
              <ThemeToggle />
              <Button
                variant="ghost"
                size="icon"
                onClick={() => toast.info('Em breve!')}
              >
                <Edit className="w-5 h-5" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={handleDelete}
                className="text-destructive hover:text-destructive"
              >
                <Trash2 className="w-5 h-5" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="container max-w-2xl mx-auto px-4 py-8 pb-[calc(2rem+env(safe-area-inset-bottom))] space-y-8 relative">
        <div className="absolute inset-0 -z-10 bg-grid-pattern opacity-[0.03] pointer-events-none" />

        {/* Goal Header */}
        <div className="card-premium overflow-hidden animate-fade-in-up border-0 ring-1 ring-border/50">
          {goal.imageUrl && (
            <div className="h-48 overflow-hidden relative">
              <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent z-10" />
              <img
                src={goal.imageUrl}
                alt={goal.name}
                className="w-full h-full object-cover"
              />
            </div>
          )}
          <div className="p-6 relative z-20 -mt-12">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h1 className="text-2xl font-bold text-foreground">{goal.name}</h1>
                {goal.productLink && (
                  <a
                    href={goal.productLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-sm text-primary hover:underline mt-1"
                  >
                    Ver produto
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                )}
              </div>
              {goal.isCompleted && (
                <span className="px-3 py-1 bg-success/10 text-success text-sm font-bold rounded-full">
                  🎉 Concluída
                </span>
              )}
            </div>

            {goal.targetDate && (
              <div className="flex items-center gap-2 mt-3 text-sm text-muted-foreground">
                <Calendar className="w-4 h-4" />
                <span>Meta: {formatDate(goal.targetDate)}</span>
              </div>
            )}

            <div className="flex items-center gap-2 mt-3 text-sm text-muted-foreground">
              <button
                disabled={toggleVisibilityMutation.isPending}
                onClick={() => toggleVisibilityMutation.mutate(!goal.isPublic)}
                className="flex items-center gap-1.5 hover:text-foreground transition-colors focus:outline-none"
              >
                {goal.isPublic ? <Globe className="w-4 h-4" /> : <Lock className="w-4 h-4" />}
                <span className="underline decoration-dashed underline-offset-4">{goal.isPublic ? 'Pública' : 'Privada'}</span>
              </button>
            </div>

            {/* Progress */}
            <div className="mt-5">
              <div className="flex justify-between items-baseline mb-2">
                <span className="text-2xl font-bold text-foreground">
                  {formatCurrency(goal.totalCurrent)}
                </span>
                <span className="text-muted-foreground">
                  de {formatCurrency(goal.targetAmount)}
                </span>
              </div>
              <ProgressBar percentage={goal.percentage} expensePercentage={goal.expensePercentage} size="lg" />
            </div>

            {/* Balances */}
            <div className="grid grid-cols-2 gap-4 mt-6">
              <div className="bg-secondary/30 rounded-xl p-4 border border-border/50">
                <div className="flex items-center gap-2 text-muted-foreground mb-2">
                  <Banknote className="w-4 h-4" />
                  <span className="text-xs font-semibold uppercase tracking-wider">Dinheiro</span>
                </div>
                <p className="font-bold text-lg text-foreground">
                  {formatCurrency(goal.currentCash)}
                </p>
              </div>
              <div className="bg-secondary/30 rounded-xl p-4 border border-border/50">
                <div className="flex items-center gap-2 text-muted-foreground mb-2">
                  <Smartphone className="w-4 h-4" />
                  <span className="text-xs font-semibold uppercase tracking-wider">Pix</span>
                </div>
                <p className="font-bold text-lg text-foreground">
                  {formatCurrency(goal.currentPix)}
                </p>
              </div>
            </div>

            {/* Add Transaction Button */}
            <Button
              className="w-full mt-6 h-12 btn-premium text-base"
              onClick={() => setIsTransactionModalOpen(true)}
            >
              <Plus className="w-5 h-5 mr-2" />
              Nova Transação
            </Button>
          </div>
        </div>

        {/* Forecast */}
        {!goal.isCompleted && (
          <div className="animate-fade-in-up" style={{ animationDelay: '100ms' }}>
            <ForecastCard forecast={forecast} remaining={remaining} />
          </div>
        )}

        {/* Tabs */}
        <div className="animate-fade-in-up" style={{ animationDelay: '200ms' }}>
          <Tabs defaultValue="transactions" className="w-full">
            <TabsList className="w-full grid grid-cols-2 h-12 bg-secondary/50 p-1 rounded-xl">
              <TabsTrigger value="transactions" className="gap-2 rounded-lg data-[state=active]:bg-background data-[state=active]:shadow-sm transition-all">
                <History className="w-4 h-4" />
                Transações
              </TabsTrigger>
              <TabsTrigger value="recurring" className="gap-2 rounded-lg data-[state=active]:bg-background data-[state=active]:shadow-sm transition-all">
                <RepeatIcon className="w-4 h-4" />
                Recorrentes
              </TabsTrigger>
            </TabsList>

            <TabsContent value="transactions" className="mt-6">
              <div className="card-premium p-6">
                {goal.transactions.length > 0 ? (
                  <div className="divide-y divide-border/50">
                    {goal.transactions.map((transaction) => (
                      <TransactionItem
                        key={transaction.id}
                        transaction={transaction}
                        onEdit={(t) => {
                          setEditingTransaction(t);
                          setIsTransactionModalOpen(true);
                        }}
                        onDelete={(transactionId) => {
                          if (confirm('Tem certeza que deseja apagar esta transação?')) {
                            deleteTransactionMutation.mutate(transactionId);
                          }
                        }}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <div className="w-16 h-16 rounded-full bg-secondary/50 flex items-center justify-center mx-auto mb-4">
                      <History className="w-8 h-8 text-muted-foreground/50" />
                    </div>
                    <p className="text-muted-foreground font-medium">
                      Nenhuma transação registrada
                    </p>
                  </div>
                )}
              </div>
            </TabsContent>

            <TabsContent value="recurring" className="mt-6">
              <div className="card-premium p-6">
                {goal.recurringPayments.length > 0 ? (
                  <div className="divide-y divide-border/50">
                    {goal.recurringPayments.map((payment) => (
                      <RecurringPaymentItem
                        key={payment.id}
                        payment={payment}
                        onEdit={(p) => {
                          setEditingRecurring(p);
                          setIsRecurringModalOpen(true);
                        }}
                        onDelete={(recurringId) => {
                          if (confirm('Tem certeza que deseja remover esta recorrência?')) {
                            deleteRecurringMutation.mutate(recurringId);
                          }
                        }}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <div className="w-16 h-16 rounded-full bg-secondary/50 flex items-center justify-center mx-auto mb-4">
                      <RepeatIcon className="w-8 h-8 text-muted-foreground/50" />
                    </div>
                    <p className="text-muted-foreground font-medium">
                      Nenhum pagamento recorrente
                    </p>
                  </div>
                )}
                <Button
                  variant="outline"
                  className="mt-4 w-full"
                  onClick={() => setIsRecurringModalOpen(true)}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Adicionar Recorrente
                </Button>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </main>

      {/* Add Transaction Modal */}
      <AddTransactionModal
        isOpen={isTransactionModalOpen}
        onClose={() => {
          setIsTransactionModalOpen(false);
          setEditingTransaction(null);
        }}
        onSubmit={handleAddTransaction}
        goalName={goal.name}
        initialData={editingTransaction ? {
          amount: editingTransaction.amount,
          type: editingTransaction.type,
          category: editingTransaction.category,
          description: editingTransaction.description || '',
        } : undefined}
      />

      {/* Add Recurring Modal */}
      <AddRecurringModal
        isOpen={isRecurringModalOpen}
        onClose={() => {
          setIsRecurringModalOpen(false);
          setEditingRecurring(null);
        }}
        onSubmit={handleAddRecurring}
        initialData={editingRecurring ? {
          name: editingRecurring.name,
          amount: editingRecurring.amount,
          type: editingRecurring.type,
          category: editingRecurring.category,
          frequency: editingRecurring.frequency,
          dayOfMonth: editingRecurring.dayOfMonth,
          dayOfWeek: editingRecurring.dayOfWeek,
          startDate: editingRecurring.startDate,
          endDate: editingRecurring.endDate,
        } : undefined}
      />

      {/* Celebration Modal */}
      <CelebrationModal
        isOpen={showCelebration}
        onClose={() => setShowCelebration(false)}
        goalName={goal.name}
        amount={goal.totalCurrent}
      />
    </div>
  );
};

export default GoalDetails;
