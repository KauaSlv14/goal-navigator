import { Forecast, formatCurrency } from '@/lib/types';
import { TrendingUp, Clock, Zap, Shield, AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/utils';


interface ForecastCardProps {
  forecast: Forecast;
  remaining: number;
}

export const ForecastCard = ({ forecast, remaining }: ForecastCardProps) => {
  const formatMonths = (months: number): string => {
    if (!isFinite(months) || months < 0) return '—';
    if (months < 1) return 'Menos de 1 mês';
    if (months === 1) return '1 mês';
    if (months < 12) return `${months} meses`;
    const years = Math.floor(months / 12);
    const remainingMonths = months % 12;
    if (remainingMonths === 0) {
      return years === 1 ? '1 ano' : `${years} anos`;
    }
    return `${years} ano${years > 1 ? 's' : ''} e ${remainingMonths} ${remainingMonths === 1 ? 'mês' : 'meses'}`;
  };

  const hasPositiveIncome = forecast.monthlyNetIncome > 0;

  return (
    <div className="card-elevated p-5">
      <div className="flex items-center gap-2 mb-4">
        <TrendingUp className="w-5 h-5 text-primary" />
        <h3 className="font-bold text-foreground">Projeção</h3>
      </div>

      {/* Monthly Net Income */}
      <div className="bg-secondary/50 rounded-lg p-3 mb-4">
        <p className="text-xs text-muted-foreground mb-1">
          Renda líquida mensal estimada
        </p>
        <p
          className={cn(
            'text-lg font-bold',
            hasPositiveIncome ? 'text-success' : 'text-destructive'
          )}
        >
          {hasPositiveIncome ? '+' : ''} {formatCurrency(forecast.monthlyNetIncome)}
        </p>
        <p className="text-xs text-muted-foreground mt-1">
          Restam {formatCurrency(remaining)} para a meta
        </p>
      </div>

      {!hasPositiveIncome && (
        <div className="flex items-start gap-3 p-3 bg-warning/10 rounded-lg mb-4">
          <AlertTriangle className="w-5 h-5 text-warning shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-warning mb-1">
              Despesas excedem entradas
            </p>
            <p className="text-xs text-warning/80 leading-relaxed">
              Considere reduzir gastos ou adicionar novas fontes de renda para ver em quanto tempo atingirá sua meta.
            </p>
          </div>
        </div>
      )}

      {/* Estimates */}
      <div className="space-y-4">
        {/* Optimistic */}
        <div className="flex items-center justify-between group p-2 hover:bg-secondary/30 rounded-lg transition-colors">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-success/10 flex items-center justify-center shrink-0">
              <Zap className="w-4 h-4 text-success" />
            </div>
            <div>
              <p className="text-sm font-semibold text-foreground">Sem imprevistos</p>
              <p className="text-xs text-muted-foreground w-36 sm:w-auto">
                Se tudo der certo, você chega lá em:
              </p>
            </div>
          </div>
          <p className="font-bold text-success text-right whitespace-nowrap">
            {formatMonths(forecast.optimistic)}
          </p>
        </div>

        {/* Probable */}
        <div className="flex items-center justify-between group p-2 hover:bg-secondary/30 rounded-lg transition-colors">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
              <Clock className="w-4 h-4 text-primary" />
            </div>
            <div>
              <p className="text-sm font-semibold text-foreground">Cenário Provável</p>
              <p className="text-xs text-muted-foreground w-36 sm:w-auto">
                Considerando pequenos gastos extras:
              </p>
            </div>
          </div>
          <p className="font-bold text-primary text-right whitespace-nowrap">
            {formatMonths(forecast.probable)}
          </p>
        </div>

        {/* Pessimistic */}
        <div className="flex items-center justify-between group p-2 hover:bg-secondary/30 rounded-lg transition-colors">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-warning/10 flex items-center justify-center shrink-0">
              <Shield className="w-4 h-4 text-warning" />
            </div>
            <div>
              <p className="text-sm font-semibold text-foreground">Cenário Conservador</p>
              <p className="text-xs text-muted-foreground w-36 sm:w-auto">
                Se houver muitos imprevistos (25%):
              </p>
            </div>
          </div>
          <p className="font-bold text-warning text-right whitespace-nowrap">
            {formatMonths(forecast.pessimistic)}
          </p>
        </div>
      </div>
    </div>
  );
};
