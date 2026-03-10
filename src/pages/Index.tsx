import { Button } from '@/components/ui/button';
import { Target, ArrowRight, Wallet, TrendingUp, Bell, Shield, CheckCircle2 } from 'lucide-react';
import { StaircaseUp } from '@/components/icons/StaircaseUp';
import { useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import { UserSession } from '@/lib/types';
import { ThemeToggle } from '@/components/ThemeToggle';

const Index = () => {
  const navigate = useNavigate();

  useEffect(() => {
    try {
      const storedUser = localStorage.getItem('user');
      if (storedUser) {
        const user: UserSession = JSON.parse(storedUser);
        if (user?.token) {
          navigate('/dashboard', { replace: true });
        }
      }
    } catch (e) {
      localStorage.removeItem('user');
    }
  }, [navigate]);

  const features = [
    {
      icon: Target,
      title: 'Múltiplas Metas',
      description: 'Crie e gerencie várias metas financeiras ao mesmo tempo',
    },
    {
      icon: Wallet,
      title: 'Saldos Separados',
      description: 'Controle seu dinheiro físico e Pix separadamente',
    },
    {
      icon: TrendingUp,
      title: 'Projeções Inteligentes',
      description: 'Veja estimativas de quando alcançará suas metas',
    },
    {
      icon: Bell,
      title: 'Pagamentos Recorrentes',
      description: 'Automatize entradas e saídas regulares',
    },
  ];

  return (
    <div className="min-h-[100dvh] bg-background overflow-hidden relative selection:bg-primary/30 pb-[env(safe-area-inset-bottom)]">
      {/* Background decoration */}
      <div className="absolute inset-0 -z-10 bg-grid-pattern opacity-[0.03] pointer-events-none" />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[800px] bg-primary/5 rounded-full blur-3xl -translate-y-1/2 animate-pulse-glow" />

      <div className="absolute top-4 right-4 z-50">
        <ThemeToggle />
      </div>

      <div className="container max-w-5xl mx-auto px-4 pt-20 pb-20 relative">
        {/* Hero Section */}
        <div className="text-center mb-20">
          {/* Logo */}
          <div className="flex justify-center mb-8 animate-fade-in-up">
            <div className="w-24 h-24 rounded-[2rem] bg-gradient-to-br from-zinc-800 to-zinc-950 flex items-center justify-center shadow-2xl shadow-zinc-950/30 ring-1 ring-white/10 group cursor-pointer transition-transform hover:scale-105 duration-500">
              <StaircaseUp className="w-12 h-12 text-white drop-shadow-md group-hover:rotate-12 transition-transform duration-500" />
            </div>
          </div>

          {/* Title */}
          <div className="animate-fade-in-up" style={{ animationDelay: '100ms' }}>
            <h1 className="text-5xl md:text-7xl font-extrabold text-foreground mb-6 tracking-tight">
              Metas
            </h1>
            <p className="text-xl md:text-2xl text-muted-foreground/80 max-w-2xl mx-auto leading-relaxed font-medium">
              Transforme seus sonhos em conquistas reais. O gerenciador financeiro elegante para quem busca resultados.
            </p>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-10 animate-fade-in-up" style={{ animationDelay: '200ms' }}>
            <Button
              className="w-full sm:w-auto h-14 px-8 rounded-full btn-premium text-lg font-bold shadow-xl shadow-emerald-500/20 hover:scale-105 transition-transform duration-300"
              onClick={() => navigate('/auth')}
            >
              Começar Agora
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
            <Button
              variant="outline"
              className="w-full sm:w-auto h-14 px-8 rounded-full border-2 border-border/50 hover:bg-secondary/50 text-lg font-semibold hover:scale-105 transition-all duration-300"
              onClick={() => navigate('/auth')}
            >
              Já tenho conta
            </Button>
          </div>
        </div>

        {/* Features */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-fade-in-up" style={{ animationDelay: '300ms' }}>
          {features.map((feature, index) => (
            <div
              key={feature.title}
              className="card-premium p-8 flex items-start gap-5 group hover:scale-[1.02] transition-all duration-300"
              style={{ animationDelay: `${300 + index * 50}ms` }}
            >
              <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center flex-shrink-0 group-hover:bg-primary group-hover:text-white transition-colors duration-300">
                <feature.icon className="w-7 h-7 text-primary group-hover:text-white transition-colors" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-foreground mb-2 group-hover:text-primary transition-colors">{feature.title}</h3>
                <p className="text-muted-foreground leading-relaxed">{feature.description}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Trust Badge */}
        <div className="mt-20 text-center animate-fade-in" style={{ animationDelay: '500ms' }}>
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-secondary/50 border border-border/50 text-muted-foreground backdrop-blur-sm">
            <Shield className="w-4 h-4 text-emerald-500" />
            <span className="text-sm font-medium">Seus dados protegidos com criptografia de ponta a ponta</span>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="py-8 border-t border-border/40 bg-background/50 backdrop-blur-sm relative z-10">
        <div className="container max-w-5xl mx-auto px-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-zinc-800 to-zinc-950 flex items-center justify-center">
                <StaircaseUp className="w-4 h-4 text-white" />
              </div>
              <span className="font-bold text-foreground tracking-tight">Metas</span>
            </div>
            <p className="text-sm text-muted-foreground font-medium">
              © 2025 Todos os direitos reservados
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
