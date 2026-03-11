import { Transaction, formatCurrency, formatDate } from '@/lib/types';
import { Edit, Trash2, ArrowDownLeft, ArrowUpRight, Banknote, Smartphone } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

interface TransactionItemProps {
  transaction: Transaction;
  onEdit?: (transaction: Transaction) => void;
  onDelete?: (id: string) => void;
}

export const TransactionItem = ({ transaction, onEdit, onDelete }: TransactionItemProps) => {
  const isIncome = transaction.category === 'entrada';

  return (
    <div className="flex items-center justify-between py-4 border-b border-border/50 last:border-0 group">
      <div className="flex items-center gap-3 min-w-0">
        <div
          className={cn(
            'w-10 h-10 rounded-full flex-shrink-0 flex items-center justify-center',
            isIncome ? 'bg-success/10' : 'bg-destructive/10'
          )}
        >
          {isIncome ? (
            <ArrowDownLeft className="w-5 h-5 text-success" />
          ) : (
            <ArrowUpRight className="w-5 h-5 text-destructive" />
          )}
        </div>
        <div className="min-w-0 overflow-hidden">
          <p className="font-medium text-foreground truncate">
            {transaction.description || (isIncome ? 'Entrada' : 'Saída')}
          </p>
          <div className="flex items-center gap-2 text-xs text-muted-foreground mt-0.5">
            <span className="flex items-center gap-1">
              {transaction.type === 'cash' ? (
                <Banknote className="w-3 h-3" />
              ) : (
                <Smartphone className="w-3 h-3" />
              )}
              {transaction.type === 'cash' ? 'Dinheiro' : 'Pix'}
            </span>
            <span>•</span>
            <span>{formatDate(transaction.createdAt)}</span>
          </div>
        </div>
      </div>
      <div className="flex flex-col items-end gap-1 ml-3 flex-shrink-0">
        <div className="flex items-center gap-1">
          <span
            className={cn(
              'font-bold text-sm sm:text-base whitespace-nowrap',
              isIncome ? 'text-success' : 'text-destructive'
            )}
          >
            {isIncome ? '+ ' : '- '} {formatCurrency(transaction.amount)}
          </span>
          <div className="flex items-center ml-1">
            {onEdit && (
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-muted-foreground hover:text-primary transition-colors"
                onClick={() => onEdit(transaction)}
              >
                <Edit className="w-4 h-4" />
              </Button>
            )}
            {onDelete && (
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors opacity-100 sm:opacity-0 sm:group-hover:opacity-100"
                onClick={() => onDelete(transaction.id)}
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
