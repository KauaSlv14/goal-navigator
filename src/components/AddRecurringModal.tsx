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
import { RecurringFormData, RecurrenceFrequency } from '@/lib/types';
import { Banknote, Smartphone, RepeatIcon, ArrowDownLeft, ArrowUpRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

interface AddRecurringModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: RecurringFormData) => Promise<void> | void;
}

const frequencyOptions: { value: RecurrenceFrequency; label: string }[] = [
  { value: 'mensal', label: 'Mensal' },
  { value: 'semanal', label: 'Semanal' },
  { value: 'diario', label: 'Diário' },
  { value: 'anual', label: 'Anual' },
];

export const AddRecurringModal = ({ isOpen, onClose, onSubmit }: AddRecurringModalProps) => {
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState<RecurringFormData>({
    name: '',
    amount: 0,
    type: 'pix',
    category: 'entrada',
    frequency: 'mensal',
    dayOfMonth: 5,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      toast.error('Digite o nome da recorrência');
      return;
    }
    if (formData.amount <= 0) {
      toast.error('O valor deve ser maior que zero');
      return;
    }

    setSubmitting(true);
    try {
      await onSubmit(formData);
      setFormData({
        name: '',
        amount: 0,
        type: 'pix',
        category: 'entrada',
        frequency: 'mensal',
        dayOfMonth: 5,
      });
      onClose();
      toast.success('Recorrência adicionada!');
    } catch (err) {
      toast.error('Não foi possível salvar a recorrência');
    } finally {
      setSubmitting(false);
    }
  };

  const renderScheduleField = () => {
    if (formData.frequency === 'mensal' || formData.frequency === 'anual') {
      return (
        <div className="space-y-2">
          <Label htmlFor="dayOfMonth" className="text-sm font-medium">
            Dia do mês
          </Label>
          <Input
            id="dayOfMonth"
            type="number"
            min={1}
            max={31}
            value={formData.dayOfMonth ?? ''}
            onChange={(e) => {
              const val = e.target.value;
              setFormData((prev) => ({
                ...prev,
                dayOfMonth: val === '' ? undefined : parseInt(val, 10),
              }));
            }}
            className="h-11"
          />
        </div>
      );
    }

    if (formData.frequency === 'semanal') {
      return (
        <div className="space-y-2">
          <Label htmlFor="dayOfWeek" className="text-sm font-medium">
            Dia da semana (0 = Domingo, 6 = Sábado)
          </Label>
          <Input
            id="dayOfWeek"
            type="number"
            min={0}
            max={6}
            value={formData.dayOfWeek ?? ''}
            onChange={(e) =>
              setFormData((prev) => ({
                ...prev,
                dayOfWeek: parseInt(e.target.value, 10) || 0,
              }))
            }
            className="h-11"
          />
        </div>
      );
    }

    return null;
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl">Nova recorrência</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-5 mt-2">
          <div className="space-y-2">
            <Label htmlFor="name" className="text-sm font-medium">
              Nome
            </Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  name: e.target.value,
                }))
              }
              placeholder="Ex: Aporte mensal"
              className="h-11"
            />
          </div>

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
                    ? 'border-warning bg-warning/10 text-warning'
                    : 'border-border bg-background text-muted-foreground hover:border-warning/50'
                )}
              >
                <ArrowUpRight className="w-5 h-5" />
                <span className="font-medium">Saída</span>
              </button>
            </div>
          </div>

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

          <div className="space-y-2">
            <Label className="text-sm font-medium flex items-center gap-1.5">
              <RepeatIcon className="w-4 h-4" />
              Frequência
            </Label>
            <select
              value={formData.frequency}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  frequency: e.target.value as RecurrenceFrequency,
                }))
              }
              className="h-11 w-full rounded-md border border-border bg-background px-3 text-sm"
            >
              {frequencyOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          {renderScheduleField()}

          <div className="flex gap-3">
            <div className="space-y-2 flex-1">
              <Label htmlFor="startDate" className="text-sm font-medium">
                Data de Início (opcional)
              </Label>
              <Input
                id="startDate"
                type="date"
                value={formData.startDate || ''}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    startDate: e.target.value,
                  }))
                }
                className="h-11"
              />
            </div>
            <div className="space-y-2 flex-1">
              <Label htmlFor="endDate" className="text-sm font-medium">
                Data Final (opcional)
              </Label>
              <Input
                id="endDate"
                type="date"
                value={formData.endDate || ''}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    endDate: e.target.value,
                  }))
                }
                className="h-11"
              />
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="flex-1"
              disabled={submitting}
            >
              Cancelar
            </Button>
            <Button type="submit" variant="gradient" className="flex-1" disabled={submitting}>
              Salvar
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
