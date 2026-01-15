import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Banknote, Smartphone, ArrowDownLeft, ArrowUpRight } from 'lucide-react';
import { TransactionType, TransactionCategory } from '@/lib/types';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface AddTransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: TransactionFormData) => void;
  goalName: string;
}

export interface TransactionFormData {
  amount: number;
  type: TransactionType;
  category: TransactionCategory;
  description: string;
}

export const AddTransactionModal = ({
  isOpen,
  onClose,
  onSubmit,
  goalName,
}: AddTransactionModalProps) => {
  const [formData, setFormData] = useState<TransactionFormData>({
    amount: 0,
    type: 'pix',
    category: 'entrada',
    description: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (formData.amount <= 0) {
      toast.error('O valor deve ser maior que zero');
      return;
    }

    onSubmit(formData);
    setFormData({
      amount: 0,
      type: 'pix',
      category: 'entrada',
      description: '',
    });
    onClose();
    toast.success(
      formData.category === 'entrada'
        ? 'Entrada registrada com sucesso!'
        : 'Saída registrada com sucesso!'
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl">Nova Transação</DialogTitle>
          <p className="text-sm text-muted-foreground">{goalName}</p>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-5 mt-4">
          {/* Category Toggle */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">Tipo</Label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() =>
                  setFormData((prev) => ({ ...prev, category: 'entrada' }))
                }
                className={cn(
                  'flex items-center justify-center gap-2 py-3 rounded-lg border-2 transition-all',
                  formData.category === 'entrada'
                    ? 'border-success bg-success/10 text-success'
                    : 'border-border bg-background text-muted-foreground hover:border-success/50'
                )}
              >
                <ArrowDownLeft className="w-5 h-5" />
                <span className="font-medium">Entrada</span>
              </button>
              <button
                type="button"
                onClick={() =>
                  setFormData((prev) => ({ ...prev, category: 'saida' }))
                }
                className={cn(
                  'flex items-center justify-center gap-2 py-3 rounded-lg border-2 transition-all',
                  formData.category === 'saida'
                    ? 'border-destructive bg-destructive/10 text-destructive'
                    : 'border-border bg-background text-muted-foreground hover:border-destructive/50'
                )}
              >
                <ArrowUpRight className="w-5 h-5" />
                <span className="font-medium">Saída</span>
              </button>
            </div>
          </div>

          {/* Payment Method Toggle */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">Origem</Label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() =>
                  setFormData((prev) => ({ ...prev, type: 'cash' }))
                }
                className={cn(
                  'flex items-center justify-center gap-2 py-3 rounded-lg border-2 transition-all',
                  formData.type === 'cash'
                    ? 'border-primary bg-primary/10 text-primary'
                    : 'border-border bg-background text-muted-foreground hover:border-primary/50'
                )}
              >
                <Banknote className="w-5 h-5" />
                <span className="font-medium">Dinheiro</span>
              </button>
              <button
                type="button"
                onClick={() =>
                  setFormData((prev) => ({ ...prev, type: 'pix' }))
                }
                className={cn(
                  'flex items-center justify-center gap-2 py-3 rounded-lg border-2 transition-all',
                  formData.type === 'pix'
                    ? 'border-primary bg-primary/10 text-primary'
                    : 'border-border bg-background text-muted-foreground hover:border-primary/50'
                )}
              >
                <Smartphone className="w-5 h-5" />
                <span className="font-medium">Pix</span>
              </button>
            </div>
          </div>

          {/* Amount */}
          <div className="space-y-2">
            <Label htmlFor="amount" className="text-sm font-medium">
              Valor (R$)
            </Label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                R$
              </span>
              <Input
                id="amount"
                type="number"
                value={formData.amount || ''}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    amount: parseFloat(e.target.value) || 0,
                  }))
                }
                placeholder="0,00"
                className="h-12 pl-10 text-lg"
                min={0}
                step={0.01}
              />
            </div>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description" className="text-sm font-medium">
              Descrição (opcional)
            </Label>
            <Input
              id="description"
              value={formData.description}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  description: e.target.value,
                }))
              }
              placeholder="Ex: Salário, Freelance, Compra..."
              className="h-11"
            />
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="flex-1"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              variant={formData.category === 'entrada' ? 'success' : 'destructive'}
              className="flex-1"
            >
              Registrar
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
