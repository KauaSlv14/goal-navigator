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
    <div className="flex items-center justify-between py-3 border-b border-border/50 last:border-0 group/item">
      <div className="flex items-center gap-3">
        <div
          className={cn(
            'w-10 h-10 rounded-full flex items-center justify-center',
            isIncome ? 'bg-success/10' : 'bg-warning/10'
          )}
        >
          <RepeatIcon
            className={cn('w-5 h-5', isIncome ? 'text-success' : 'text-warning')}
          />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <p className="font-medium text-foreground">{payment.name}</p>
            <span
              className={cn(
                'text-xs px-2 py-0.5 rounded-full',
                isIncome
                  ? 'bg-success/10 text-success'
                  : 'bg-warning/10 text-warning'
              )}
            >
              {frequencyLabels[payment.frequency]}
            </span>
          </div>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            {payment.type === 'cash' ? (
              <Banknote className="w-3.5 h-3.5" />
            ) : (
              <Smartphone className="w-3.5 h-3.5" />
            )}
            <span>{payment.type === 'cash' ? 'Dinheiro' : 'Pix'}</span>
            <span>•</span>
            <span>Próximo: {formatDate(payment.nextExecution)}</span>
          </div>
        </div>
      </div>
      <div className="flex items-center gap-4">
        <div className="text-right">
          <span
            className={cn(
              'font-bold flex items-center gap-1 justify-end',
              isIncome ? 'text-success' : 'text-warning'
            )}
          >
            {isIncome ? (
              <ArrowDownLeft className="w-4 h-4" />
            ) : (
              <ArrowUpRight className="w-4 h-4" />
            )}
            {formatCurrency(payment.amount)}
          </span>
          {payment.lastExecution && (
            <span className="text-xs text-muted-foreground">
              Último: {formatDate(payment.lastExecution)}
            </span>
          )}
        </div>
        <div className="flex items-center gap-1">
          {onEdit && (
            <Button
              variant="ghost"
              size="icon"
              className="text-muted-foreground hover:text-primary h-8 w-8"
              onClick={() => onEdit(payment)}
            >
              <Edit className="w-4 h-4" />
            </Button>
          )}
          {onDelete && (
            <Button
              variant="ghost"
              size="icon"
              className="opacity-0 group-hover/item:opacity-100 transition-opacity text-muted-foreground hover:text-destructive hover:bg-destructive/10 h-8 w-8"
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
