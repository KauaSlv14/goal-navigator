import {
  RecurringPayment,
  formatCurrency,
  formatDate,
  frequencyLabels,
} from '@/lib/types';
import { Edit, RepeatIcon, Banknote, Smartphone, ArrowDownLeft, ArrowUpRight, Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

interface RecurringPaymentItemProps {
  payment: RecurringPayment;
  onEdit?: (payment: RecurringPayment) => void;
  onDelete?: (id: string) => void;
}

export const RecurringPaymentItem = ({ payment, onEdit, onDelete }: RecurringPaymentItemProps) => {
  const isIncome = payment.category === 'entrada';

  return (
    <div className="py-4 border-b border-border/50 last:border-0 group">
      {/* Row 1: Icon + Name + Frequency badge */}
      <div className="flex items-center gap-3">
        <div
          className={cn(
            'w-10 h-10 rounded-full flex-shrink-0 flex items-center justify-center',
            isIncome ? 'bg-success/10' : 'bg-warning/10'
          )}
        >
          <RepeatIcon
            className={cn('w-5 h-5', isIncome ? 'text-success' : 'text-warning')}
          />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <p className="font-medium text-foreground truncate">{payment.name}</p>
            <span
              className={cn(
                'text-[10px] sm:text-xs px-2 py-0.5 rounded-full whitespace-nowrap flex-shrink-0',
                isIncome
                  ? 'bg-success/10 text-success'
                  : 'bg-warning/10 text-warning'
              )}
            >
              {frequencyLabels[payment.frequency]}
            </span>
          </div>
          <div className="flex items-center gap-2 text-xs text-muted-foreground mt-0.5">
            <span className="flex items-center gap-1">
              {payment.type === 'cash' ? (
                <Banknote className="w-3 h-3" />
              ) : (
                <Smartphone className="w-3 h-3" />
              )}
              {payment.type === 'cash' ? 'Dinheiro' : 'Pix'}
            </span>
            <span>•</span>
            <span className="truncate">Próximo: {formatDate(payment.nextExecution)}</span>
          </div>
        </div>
      </div>

      {/* Row 2: Amount + Actions (aligned to the right, below the name) */}
      <div className="flex items-center justify-between mt-2 ml-[52px]">
        <span
          className={cn(
            'font-bold text-sm flex items-center gap-0.5',
            isIncome ? 'text-success' : 'text-warning'
          )}
        >
          {isIncome ? (
            <ArrowDownLeft className="w-3.5 h-3.5" />
          ) : (
            <ArrowUpRight className="w-3.5 h-3.5" />
          )}
          {formatCurrency(payment.amount)}
        </span>
        <div className="flex items-center gap-0.5">
          {payment.lastExecution && (
            <span className="text-[10px] text-muted-foreground mr-2">
              Último: {formatDate(payment.lastExecution)}
            </span>
          )}
          {onEdit && (
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-muted-foreground hover:text-primary transition-colors"
              onClick={() => onEdit(payment)}
            >
              <Edit className="w-4 h-4" />
            </Button>
          )}
          {onDelete && (
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
              onClick={() => onDelete(payment.id)}
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};
