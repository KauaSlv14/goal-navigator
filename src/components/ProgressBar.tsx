import { cn } from '@/lib/utils';

interface ProgressBarProps {
  percentage: number;
  showLabel?: boolean;
  size?: 'sm' | 'md' | 'lg';
  animated?: boolean;
  className?: string;
}

export const ProgressBar = ({
  percentage,
  showLabel = true,
  size = 'md',
  animated = true,
  className,
}: ProgressBarProps) => {
  const clampedPercentage = Math.min(100, Math.max(0, percentage));
  
  const sizeClasses = {
    sm: 'h-2',
    md: 'h-3',
    lg: 'h-4',
  };

  return (
    <div className={cn('w-full', className)}>
      <div
        className={cn(
          'w-full bg-secondary rounded-full overflow-hidden',
          sizeClasses[size]
        )}
      >
        <div
          className={cn(
            'progress-bar h-full',
            animated && 'animate-progress-fill',
            clampedPercentage === 100 && 'animate-pulse-glow'
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
