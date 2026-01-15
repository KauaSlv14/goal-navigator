import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { GoalCard } from '@/components/GoalCard';
import { CreateGoalModal, GoalFormData } from '@/components/CreateGoalModal';
import { CelebrationModal } from '@/components/CelebrationModal';
import { getAllGoalsWithProgress, addGoal } from '@/lib/mockData';
import { formatCurrency, GoalWithProgress } from '@/lib/types';
import {
  Target,
  Plus,
  Wallet,
  Banknote,
  Smartphone,
  LogOut,
  User,
} from 'lucide-react';
import { toast } from 'sonner';

export const Dashboard = () => {
  const navigate = useNavigate();
  const [goals, setGoals] = useState<GoalWithProgress[]>(getAllGoalsWithProgress());
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [celebrationGoal, setCelebrationGoal] = useState<GoalWithProgress | null>(null);

  // Calculate totals
  const totalCash = goals.reduce((sum, g) => sum + g.currentCash, 0);
  const totalPix = goals.reduce((sum, g) => sum + g.currentPix, 0);
  const totalBalance = totalCash + totalPix;

  const completedGoals = goals.filter((g) => g.isCompleted);
  const activeGoals = goals.filter((g) => !g.isCompleted);

  const handleGoalClick = (goal: GoalWithProgress) => {
    navigate(`/goal/${goal.id}`);
  };

  const handleCreateGoal = (data: GoalFormData) => {
    const totalCurrent = data.initialCash + data.initialPix;
    const percentage = (totalCurrent / data.targetAmount) * 100;
    const isCompleted = percentage >= 100;

    const newGoal: GoalWithProgress = {
      id: `goal-${Date.now()}`,
      userId: 'user1',
      name: data.name,
      targetAmount: data.targetAmount,
      currentCash: data.initialCash,
      currentPix: data.initialPix,
      imageUrl: data.imageUrl,
      productLink: data.productLink,
      targetDate: data.targetDate ? new Date(data.targetDate) : undefined,
      safetyMargin: data.safetyMargin,
      createdAt: new Date(),
      updatedAt: new Date(),
      isCompleted,
      totalCurrent,
      percentage,
      transactions: [],
      recurringPayments: [],
    };

    setGoals((prev) => [newGoal, ...prev]);
    addGoal({
      id: newGoal.id,
      userId: newGoal.userId,
      name: newGoal.name,
      targetAmount: newGoal.targetAmount,
      currentCash: newGoal.currentCash,
      currentPix: newGoal.currentPix,
      imageUrl: newGoal.imageUrl,
      productLink: newGoal.productLink,
      targetDate: newGoal.targetDate,
      safetyMargin: newGoal.safetyMargin,
      createdAt: newGoal.createdAt,
      updatedAt: newGoal.updatedAt,
      isCompleted: newGoal.isCompleted,
    });

    // Check if goal is immediately completed
    if (newGoal.isCompleted) {
      setTimeout(() => setCelebrationGoal(newGoal), 500);
    }
  };

  const handleLogout = () => {
    toast.success('Até logo!');
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-background/80 backdrop-blur-lg border-b border-border">
        <div className="container max-w-2xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-success flex items-center justify-center shadow-glow">
                <Target className="w-5 h-5 text-primary-foreground" />
              </div>
              <div>
                <h1 className="font-bold text-foreground">Cofre de Metas</h1>
                <p className="text-xs text-muted-foreground">Olá, Usuário</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="icon" onClick={() => toast.info('Em breve!')}>
                <User className="w-5 h-5" />
              </Button>
              <Button variant="ghost" size="icon" onClick={handleLogout}>
                <LogOut className="w-5 h-5" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="container max-w-2xl mx-auto px-4 py-6 space-y-6">
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

          {activeGoals.length > 0 ? (
            <div className="space-y-4">
              {activeGoals.map((goal, index) => (
                <GoalCard
                  key={goal.id}
                  goal={goal}
                  onClick={() => handleGoalClick(goal)}
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
              <Button
                variant="gradient"
                onClick={() => setIsCreateModalOpen(true)}
              >
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
              Metas Concluídas 🎉 ({completedGoals.length})
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
