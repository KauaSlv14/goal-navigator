import { cn } from '@/lib/utils';

interface ProgressBarProps {
  percentage: number;
  expensePercentage?: number;
  showLabel?: boolean;
  size?: 'sm' | 'md' | 'lg';
  animated?: boolean;
  className?: string;
}

export const ProgressBar = ({
  percentage,
  expensePercentage = 0,
  showLabel = true,
  size = 'md',
  animated = true,
  className,
}: ProgressBarProps) => {
  const clampedPercentage = Math.min(100, Math.max(0, percentage));
  const clampedExpense = Math.min(100 - clampedPercentage, Math.max(0, expensePercentage));

  const sizeClasses = {
    sm: 'h-2',
    md: 'h-3',
    lg: 'h-4',
  };

  const totalProgress = Math.min(100, clampedPercentage + clampedExpense);

  return (
    <div className={cn('w-full', className)}>
      <div
        className={cn(
          'w-full bg-secondary rounded-full overflow-hidden relative',
          sizeClasses[size]
        )}
      >
        {/* Faded Background Bar (Total Progress + Expense) */}
        {clampedExpense > 0 && (
          <div
            className={cn(
              'absolute top-0 left-0 h-full bg-primary/30 rounded-full transition-all duration-700 ease-out',
              animated && 'animate-progress-fill'
            )}
            style={{ width: `${totalProgress}%` }}
          />
        )}

        {/* Main Progress Bar (Net) */}
        <div
          className={cn(
            'absolute top-0 left-0 progress-bar h-full rounded-full z-10',
            animated && 'animate-progress-fill',
            clampedPercentage >= 100 && 'animate-pulse-glow'
          )}
          style={{ width: `${clampedPercentage}%` }}
        />
      </div>
      {showLabel && (
        <div className="flex justify-between items-center mt-1.5">
          <span className="text-xs font-medium text-muted-foreground">
            {clampedPercentage.toFixed(1)}% concluído
          </span>
          {clampedPercentage === 100 && (
            <span className="text-xs font-bold text-success">
              Meta atingida! 🎉
            </span>
          )}
        </div>
      )}
    </div>
  );
};
