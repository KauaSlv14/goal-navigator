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
} from 'lucide-react';
import { toast } from 'sonner';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { createRecurringPayment, createTransaction, deleteGoal as deleteGoalApi, getGoalDetails } from '@/lib/api';
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
  const [showCelebration, setShowCelebration] = useState(false);

  useEffect(() => {
    if (!user?.email) {
      navigate('/auth');
    }
  }, [user?.email, navigate]);

  const goalQuery = useQuery({
    queryKey: ['goal', id, user?.email],
    queryFn: () => getGoalDetails(id!, user as UserSession),
    enabled: !!id && !!user?.email,
    retry: false,
    onSuccess: (data) => setGoal(data),
    onError: () => {
      toast.error('Meta não encontrada');
      navigate('/dashboard');
    },
  });

  const transactionMutation = useMutation({
    mutationFn: (payload: TransactionFormData) => createTransaction(id!, payload, user as UserSession),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['goal', id, user?.email] });
      const updated = await queryClient.fetchQuery({
        queryKey: ['goal', id, user?.email],
        queryFn: () => getGoalDetails(id!, user as UserSession),
      });
      setGoal(updated);
      if (!goal?.isCompleted && updated.isCompleted) {
        setTimeout(() => setShowCelebration(true), 500);
      }
    },
    onError: (err: any) => toast.error(err?.message ?? 'Não foi possível registrar a transação'),
  });

  const recurringMutation = useMutation({
    mutationFn: (payload: RecurringFormData) => createRecurringPayment(id!, payload, user as UserSession),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['goal', id, user?.email] });
      const updated = await queryClient.fetchQuery({
        queryKey: ['goal', id, user?.email],
        queryFn: () => getGoalDetails(id!, user as UserSession),
      });
      setGoal(updated);
      toast.success('Recorrência criada!');
    },
    onError: (err: any) => toast.error(err?.message ?? 'Não foi possível criar a recorrência'),
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

  if (goalQuery.isLoading || !goal) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
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
    goal.recurringPayments
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
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-background/80 backdrop-blur-lg border-b border-border">
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

      <main className="container max-w-2xl mx-auto px-4 py-6 space-y-6">
        {/* Goal Header */}
        <div className="card-elevated overflow-hidden animate-fade-in-up">
          {goal.imageUrl && (
            <div className="h-40 overflow-hidden">
              <img
                src={goal.imageUrl}
                alt={goal.name}
                className="w-full h-full object-cover"
              />
            </div>
          )}
          <div className="p-5">
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
              <ProgressBar percentage={goal.percentage} size="lg" />
            </div>

            {/* Balances */}
            <div className="grid grid-cols-2 gap-3 mt-5">
              <div className="bg-secondary/50 rounded-lg p-3">
                <div className="flex items-center gap-2 text-muted-foreground mb-1">
                  <Banknote className="w-4 h-4" />
                  <span className="text-xs font-medium">Dinheiro</span>
                </div>
                <p className="font-bold text-foreground">
                  {formatCurrency(goal.currentCash)}
                </p>
              </div>
              <div className="bg-secondary/50 rounded-lg p-3">
                <div className="flex items-center gap-2 text-muted-foreground mb-1">
                  <Smartphone className="w-4 h-4" />
                  <span className="text-xs font-medium">Pix</span>
                </div>
                <p className="font-bold text-foreground">
                  {formatCurrency(goal.currentPix)}
                </p>
              </div>
            </div>

            {/* Add Transaction Button */}
            <Button
              variant="gradient"
              size="lg"
              className="w-full mt-5"
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
            <TabsList className="w-full grid grid-cols-2 h-12">
              <TabsTrigger value="transactions" className="gap-2">
                <History className="w-4 h-4" />
                Transações
              </TabsTrigger>
              <TabsTrigger value="recurring" className="gap-2">
                <RepeatIcon className="w-4 h-4" />
                Recorrentes
              </TabsTrigger>
            </TabsList>

            <TabsContent value="transactions" className="mt-4">
              <div className="card-elevated p-4">
                {goal.transactions.length > 0 ? (
                  <div className="divide-y divide-border">
                    {goal.transactions.map((transaction) => (
                      <TransactionItem key={transaction.id} transaction={transaction} />
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <History className="w-10 h-10 text-muted-foreground mx-auto mb-2" />
                    <p className="text-muted-foreground">
                      Nenhuma transação registrada
                    </p>
                  </div>
                )}
              </div>
            </TabsContent>

            <TabsContent value="recurring" className="mt-4">
              <div className="card-elevated p-4">
                {goal.recurringPayments.length > 0 ? (
                  <div className="divide-y divide-border">
                    {goal.recurringPayments.map((payment) => (
                      <RecurringPaymentItem key={payment.id} payment={payment} />
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <RepeatIcon className="w-10 h-10 text-muted-foreground mx-auto mb-2" />
                    <p className="text-muted-foreground">
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
        onClose={() => setIsTransactionModalOpen(false)}
        onSubmit={handleAddTransaction}
        goalName={goal.name}
      />

      {/* Add Recurring Modal */}
      <AddRecurringModal
        isOpen={isRecurringModalOpen}
        onClose={() => setIsRecurringModalOpen(false)}
        onSubmit={handleAddRecurring}
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
