import {
  RecurringPayment,
  formatCurrency,
  formatDate,
  frequencyLabels,
} from '@/lib/types';
import { RepeatIcon, Banknote, Smartphone, ArrowDownLeft, ArrowUpRight } from 'lucide-react';
import { cn } from '@/lib/utils';

interface RecurringPaymentItemProps {
  payment: RecurringPayment;
}

export const RecurringPaymentItem = ({ payment }: RecurringPaymentItemProps) => {
  const isIncome = payment.category === 'entrada';

  return (
    <div className="flex items-center justify-between py-3 border-b border-border/50 last:border-0">
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
      <div className="text-right">
        <span
          className={cn(
            'font-bold flex items-center gap-1',
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
    </div>
  );
};
