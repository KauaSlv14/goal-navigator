import { Target, Calendar, ArrowRight, Banknote, Smartphone } from 'lucide-react';
import { GoalWithProgress, formatCurrency, formatDate } from '@/lib/types';
import { ProgressBar } from './ProgressBar';
import { cn } from '@/lib/utils';

interface GoalCardProps {
  goal: GoalWithProgress;
  onClick: () => void;
  onAddTransaction?: (type: 'entrada' | 'saida') => void;
  index?: number;
}

export const GoalCard = ({ goal, onClick, onAddTransaction, index = 0 }: GoalCardProps) => {
  const animationDelay = `${index * 100}ms`;

  return (
    <div
      onClick={onClick}
      className={cn(
        'card-elevated p-5 cursor-pointer group transition-all duration-300 hover:scale-[1.02] animate-fade-in-up relative',
        goal.isCompleted && 'ring-2 ring-success/30'
      )}
      style={{ animationDelay }}
    >
      <div className="flex gap-4">
        {/* Image */}
        <div className="relative w-20 h-20 rounded-xl overflow-hidden flex-shrink-0 bg-secondary">
          {goal.imageUrl ? (
            <img
              src={goal.imageUrl}
              alt={goal.name}
              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <Target className="w-8 h-8 text-muted-foreground" />
            </div>
          )}
          {goal.isCompleted && (
            <div className="absolute inset-0 bg-success/20 flex items-center justify-center">
              <span className="text-2xl">✓</span>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <h3 className="font-bold text-foreground truncate text-lg">
              {goal.name}
            </h3>
            <ArrowRight className="w-5 h-5 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all flex-shrink-0" />
          </div>

          {/* Balances */}
          <div className="flex items-center gap-4 mt-2 text-sm">
            <div className="flex items-center gap-1.5 text-muted-foreground">
              <Banknote className="w-4 h-4" />
              <span>{formatCurrency(goal.currentCash)}</span>
            </div>
            <div className="flex items-center gap-1.5 text-muted-foreground">
              <Smartphone className="w-4 h-4" />
              <span>{formatCurrency(goal.currentPix)}</span>
            </div>
          </div>

          {/* Progress */}
          <div className="mt-3">
            <div className="flex justify-between items-baseline mb-1">
              <span className="text-sm font-semibold text-foreground">
                {formatCurrency(goal.totalCurrent)}
              </span>
              <span className="text-sm text-muted-foreground">
                de {formatCurrency(goal.targetAmount)}
              </span>
            </div>
            <ProgressBar percentage={goal.percentage} showLabel={false} size="sm" />
          </div>

          {/* Target date */}
          {goal.targetDate && (
            <div className="flex items-center gap-1.5 mt-2 text-xs text-muted-foreground">
              <Calendar className="w-3.5 h-3.5" />
              <span>Meta: {formatDate(goal.targetDate)}</span>
            </div>
          )}

          {/* Actions */}
          {onAddTransaction && !goal.isCompleted && (
            <div className="mt-3 flex gap-2">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onAddTransaction('saida');
                }}
                className="flex-1 bg-destructive/10 hover:bg-destructive/20 text-destructive text-sm font-medium py-2 rounded-lg transition-colors flex items-center justify-center gap-1.5"
              >
                Adicionar Despesa
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
