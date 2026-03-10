import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { GoalCard } from '@/components/GoalCard';
import { CreateGoalModal } from '@/components/CreateGoalModal';
import { CelebrationModal } from '@/components/CelebrationModal';
import { AddTransactionModal } from '@/components/AddTransactionModal';
import { createTransaction, createGoal, getGoals } from '@/lib/api';
import { getAvatarUrl } from '@/lib/utils';
import { UserSession, GoalWithProgress, GoalFormData, formatCurrency, TransactionFormData } from '@/lib/types';
import { Target, Plus, Wallet, Banknote, Smartphone, LogOut, User, Users } from 'lucide-react';
import { toast } from 'sonner';

export const Dashboard = () => {
  const navigate = useNavigate();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isTransactionModalOpen, setIsTransactionModalOpen] = useState(false);
  const [selectedGoalForTransaction, setSelectedGoalForTransaction] = useState<GoalWithProgress | null>(null);
  const [celebrationGoal, setCelebrationGoal] = useState<GoalWithProgress | null>(null);
  const queryClient = useQueryClient();
  const storedUser = localStorage.getItem('user');
  const user: UserSession | null = storedUser ? JSON.parse(storedUser) : null;

  useEffect(() => {
    if (!user?.email || !user?.token) {
      navigate('/auth');
    }
  }, [user?.email, user?.token, navigate]);

  const { data: goals = [], isLoading } = useQuery({
    queryKey: ['goals', user?.email],
    queryFn: () => getGoals(user as UserSession),
    enabled: !!user?.email && !!user?.token,
  });

  const createGoalMutation = useMutation({
    mutationFn: (data: GoalFormData) => createGoal(data, user as UserSession),
    onSuccess: (newGoal) => {
      queryClient.setQueryData(['goals', user?.email], (old?: GoalWithProgress[]) =>
        old ? [newGoal, ...old] : [newGoal]
      );
      if (newGoal.isCompleted) {
        setTimeout(() => setCelebrationGoal(newGoal), 500);
      }
    },
    onError: (err: any) => {
      toast.error(err?.message ?? 'Não foi possível criar a meta');
    },
  });

  const transactionMutation = useMutation({
    mutationFn: ({ goalId, payload }: { goalId: string; payload: TransactionFormData }) =>
      createTransaction(goalId, payload, user as UserSession),
    onSuccess: async (_, variables) => {
      // Invalidate specific goal query if detailing
      await queryClient.invalidateQueries({ queryKey: ['goal', variables.goalId, user?.email] });
      // Invalidate goals list
      await queryClient.invalidateQueries({ queryKey: ['goals', user?.email] });

      const updatedGoals = await queryClient.fetchQuery({
        queryKey: ['goals', user?.email],
        queryFn: () => getGoals(user as UserSession),
      });

      const updatedGoal = updatedGoals.find(g => g.id === variables.goalId);

      if (updatedGoal && !variables.payload.deductFromTarget && !updatedGoal.isCompleted) {
        // Logic for completion check if we had reference to old goal state, but simpler:
        // If it just completed, show celebration.
        // We don't have old state handy easily here without complexity.
        // Let's just celebrate if it is completed and we just added income?
        // Simplification: just close modal.
      }

      setIsTransactionModalOpen(false);
      setSelectedGoalForTransaction(null);
      toast.success(
        variables.payload.category === 'entrada'
          ? 'Entrada registrada com sucesso!'
          : 'Despesa registrada com sucesso!'
      );
    },
    onError: (err: any) => {
      toast.error(err?.message ?? 'Não foi possível registrar a transação');
    }
  });


  const totalCash = goals.reduce((sum, g) => sum + g.currentCash, 0);
  const totalPix = goals.reduce((sum, g) => sum + g.currentPix, 0);
  const totalBalance = totalCash + totalPix;

  const completedGoals = goals.filter((g) => g.isCompleted);
  const activeGoals = goals.filter((g) => !g.isCompleted);

  const handleGoalClick = (goal: GoalWithProgress) => {
    navigate(`/goal/${goal.id}`);
  };

  const handleCreateGoal = async (data: GoalFormData) => {
    if (!user?.email || !user?.token) {
      toast.error('Faça login para criar metas');
      return;
    }
    await createGoalMutation.mutateAsync(data);
  };

  const handleAddTransaction = async (data: TransactionFormData) => {
    if (!selectedGoalForTransaction) return;
    await transactionMutation.mutateAsync({ goalId: selectedGoalForTransaction.id, payload: data });
  };

  const openTransactionModal = (goal: GoalWithProgress) => {
    setSelectedGoalForTransaction(goal);
    setIsTransactionModalOpen(true);
  };

  const handleLogout = () => {
    localStorage.removeItem('user');
    toast.success('Até logo!');
    navigate('/');
  };

  return (
    <div className="min-h-[100dvh] bg-background">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-background/80 backdrop-blur-lg border-b border-border pt-[env(safe-area-inset-top)]">
        <div className="container max-w-2xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-success flex items-center justify-center shadow-glow">
                <Target className="w-5 h-5 text-primary-foreground" />
              </div>
              <div>
                <h1 className="font-bold text-foreground">Cofre de Metas</h1>
                <p className="text-xs text-muted-foreground">Olá, {user?.name || 'Usuário'}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Button variant="ghost" className="relative h-10 w-10 rounded-full bg-secondary hover:bg-secondary/80 p-0 overflow-hidden" onClick={() => navigate('/profile')}>
                {user?.avatarUrl ? (
                  <img
                    src={getAvatarUrl(user.avatarUrl)}
                    alt="Profile"
                    className="w-10 h-10 object-cover"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center bg-primary text-primary-foreground font-bold text-lg">
                    {user?.name?.charAt(0).toUpperCase() || 'U'}
                  </div>
                )}
              </Button>
              <Button variant="ghost" size="icon" onClick={() => navigate('/friends')}>
                <Users className="w-5 h-5" />
              </Button>
              <Button variant="ghost" size="icon" onClick={handleLogout}>
                <LogOut className="w-5 h-5" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="container max-w-2xl mx-auto px-4 py-6 pb-[calc(1.5rem+env(safe-area-inset-bottom))] space-y-6">
        {/* Balance Overview */}
        <div className="card-elevated p-5 animate-fade-in-up">
          <div className="flex items-center gap-2 mb-4">
            <Wallet className="w-5 h-5 text-primary" />
            <h2 className="font-bold text-foreground">Saldo Total</h2>
          </div>

          <div className="text-3xl font-extrabold text-gradient mb-4">
            {formatCurrency(totalBalance)}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="bg-secondary/50 rounded-lg p-3">
              <div className="flex items-center gap-2 text-muted-foreground mb-1">
                <Banknote className="w-4 h-4" />
                <span className="text-xs font-medium">Dinheiro</span>
              </div>
              <p className="font-bold text-foreground">{formatCurrency(totalCash)}</p>
            </div>
            <div className="bg-secondary/50 rounded-lg p-3">
              <div className="flex items-center gap-2 text-muted-foreground mb-1">
                <Smartphone className="w-4 h-4" />
                <span className="text-xs font-medium">Pix</span>
              </div>
              <p className="font-bold text-foreground">{formatCurrency(totalPix)}</p>
            </div>
          </div>
        </div>

        {/* Active Goals */}
        <div className="animate-fade-in-up" style={{ animationDelay: '100ms' }}>
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold text-foreground text-lg">
              Metas Ativas ({activeGoals.length})
            </h2>
            <Button
              variant="gradient"
              size="sm"
              onClick={() => setIsCreateModalOpen(true)}
              className="gap-1.5"
            >
              <Plus className="w-4 h-4" />
              Criar Meta
            </Button>
          </div>

          {isLoading ? (
            <div className="card-elevated p-6 text-center text-muted-foreground">
              Carregando metas...
            </div>
          ) : activeGoals.length > 0 ? (
            <div className="space-y-4">
              {activeGoals.map((goal, index) => (
                <GoalCard
                  key={goal.id}
                  goal={goal}
                  onClick={() => handleGoalClick(goal)}
                  onAddTransaction={() => openTransactionModal(goal)}
                  index={index}
                />
              ))}
            </div>
          ) : (
            <div className="card-elevated p-8 text-center">
              <Target className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
              <h3 className="font-bold text-foreground mb-1">Nenhuma meta ativa</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Crie sua primeira meta e comece a acompanhar seu progresso!
              </p>
              <Button variant="gradient" onClick={() => setIsCreateModalOpen(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Criar Primeira Meta
              </Button>
            </div>
          )}
        </div>

        {/* Completed Goals */}
        {completedGoals.length > 0 && (
          <div className="animate-fade-in-up" style={{ animationDelay: '200ms' }}>
            <h2 className="font-bold text-foreground text-lg mb-4">
              Metas Concluídas ({completedGoals.length})
            </h2>
            <div className="space-y-4">
              {completedGoals.map((goal, index) => (
                <GoalCard
                  key={goal.id}
                  goal={goal}
                  onClick={() => handleGoalClick(goal)}
                  index={index}
                />
              ))}
            </div>
          </div>
        )}
      </main>

      {/* Create Goal Modal */}
      <CreateGoalModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSubmit={handleCreateGoal}
      />

      {/* Add Transaction Modal */}
      {selectedGoalForTransaction && (
        <AddTransactionModal
          isOpen={isTransactionModalOpen}
          onClose={() => {
            setIsTransactionModalOpen(false);
            setSelectedGoalForTransaction(null);
          }}
          onSubmit={handleAddTransaction}
          goalName={selectedGoalForTransaction.name}
        />
      )}

      {/* Celebration Modal */}
      {celebrationGoal && (
        <CelebrationModal
          isOpen={!!celebrationGoal}
          onClose={() => setCelebrationGoal(null)}
          goalName={celebrationGoal.name}
          amount={celebrationGoal.totalCurrent}
        />
      )}
    </div>
  );
};

export default Dashboard;
