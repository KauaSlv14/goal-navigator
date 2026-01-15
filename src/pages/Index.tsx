import { Button } from '@/components/ui/button';
import { Target, ArrowRight, Wallet, TrendingUp, Bell, Shield } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Index = () => {
  const navigate = useNavigate();

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
    <div className="min-h-screen bg-background overflow-hidden">
      {/* Hero Section */}
      <div className="relative">
        {/* Background decoration */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[800px] bg-gradient-to-br from-primary/10 to-success/5 rounded-full blur-3xl -translate-y-1/2" />
        </div>

        <div className="container max-w-4xl mx-auto px-4 pt-16 pb-20 relative">
          {/* Logo */}
          <div className="flex justify-center mb-8 animate-fade-in-up">
            <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-primary to-success flex items-center justify-center shadow-glow">
              <Target className="w-10 h-10 text-primary-foreground" />
            </div>
          </div>

          {/* Title */}
          <div className="text-center mb-12 animate-fade-in-up" style={{ animationDelay: '100ms' }}>
            <h1 className="text-4xl md:text-5xl font-extrabold text-foreground mb-4">
              Cofre de <span className="text-gradient">Metas</span>
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground max-w-xl mx-auto">
              Transforme seus sonhos em conquistas. Planeje, acompanhe e alcance suas metas financeiras.
            </p>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16 animate-fade-in-up" style={{ animationDelay: '200ms' }}>
            <Button
              variant="gradient"
              size="xl"
              onClick={() => navigate('/auth')}
              className="w-full sm:w-auto"
            >
              Começar Agora
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
            <Button
              variant="outline"
              size="xl"
              onClick={() => navigate('/auth')}
              className="w-full sm:w-auto"
            >
              Já tenho conta
            </Button>
          </div>

          {/* Features */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-fade-in-up" style={{ animationDelay: '300ms' }}>
            {features.map((feature, index) => (
              <div
                key={feature.title}
                className="card-elevated p-5 flex items-start gap-4 transition-all hover:scale-[1.02]"
                style={{ animationDelay: `${300 + index * 50}ms` }}
              >
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <feature.icon className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-bold text-foreground mb-1">{feature.title}</h3>
                  <p className="text-sm text-muted-foreground">{feature.description}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Trust Badge */}
          <div className="flex items-center justify-center gap-2 mt-12 text-muted-foreground animate-fade-in" style={{ animationDelay: '500ms' }}>
            <Shield className="w-5 h-5 text-primary" />
            <span className="text-sm">Seus dados protegidos com criptografia</span>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="py-8 border-t border-border">
        <div className="container max-w-4xl mx-auto px-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <Target className="w-5 h-5 text-primary" />
              <span className="font-semibold text-foreground">Cofre de Metas</span>
            </div>
            <p className="text-sm text-muted-foreground">
              © 2025 Todos os direitos reservados
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
