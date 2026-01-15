import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Target, Mail, Lock, User, ArrowLeft, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';

type AuthMode = 'login' | 'register' | 'forgot';

export const Auth = () => {
  const navigate = useNavigate();
  const [mode, setMode] = useState<AuthMode>('login');
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    // Basic validation
    if (!formData.email) {
      toast.error('Digite seu e-mail');
      setLoading(false);
      return;
    }

    if (mode === 'register') {
      if (!formData.name) {
        toast.error('Digite seu nome');
        setLoading(false);
        return;
      }
      if (formData.password.length < 6) {
        toast.error('A senha deve ter pelo menos 6 caracteres');
        setLoading(false);
        return;
      }
      if (formData.password !== formData.confirmPassword) {
        toast.error('As senhas não coincidem');
        setLoading(false);
        return;
      }
    }

    // Mock authentication - replace with real auth when backend is connected
    setTimeout(() => {
      setLoading(false);
      if (mode === 'forgot') {
        toast.success('E-mail de recuperação enviado! Verifique sua caixa de entrada.');
        setMode('login');
      } else {
        const userPayload = {
          email: formData.email,
          name: formData.name || formData.email.split('@')[0],
        };
        localStorage.setItem('user', JSON.stringify(userPayload));
        toast.success(mode === 'register' ? 'Conta criada com sucesso!' : 'Login realizado com sucesso!');
        navigate('/dashboard');
      }
    }, 500);
  };

  const renderTitle = () => {
    switch (mode) {
      case 'login':
        return 'Entrar';
      case 'register':
        return 'Criar Conta';
      case 'forgot':
        return 'Recuperar Senha';
    }
  };

  const renderSubtitle = () => {
    switch (mode) {
      case 'login':
        return 'Acesse suas metas financeiras';
      case 'register':
        return 'Comece a conquistar seus objetivos';
      case 'forgot':
        return 'Enviaremos um link para redefinir sua senha';
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
      {/* Logo */}
      <div className="flex items-center gap-3 mb-8 animate-fade-in-up">
        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary to-success flex items-center justify-center shadow-glow">
          <Target className="w-8 h-8 text-primary-foreground" />
        </div>
        <div>
          <h1 className="text-2xl font-extrabold text-gradient">Cofre de Metas</h1>
          <p className="text-sm text-muted-foreground">Seus sonhos, seu controle</p>
        </div>
      </div>

      {/* Auth Card */}
      <div className="w-full max-w-md card-elevated p-8 animate-fade-in-up" style={{ animationDelay: '100ms' }}>
        {mode !== 'login' && (
          <button
            onClick={() => setMode('login')}
            className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors mb-6"
          >
            <ArrowLeft className="w-4 h-4" />
            Voltar ao login
          </button>
        )}

        <div className="mb-6">
          <h2 className="text-2xl font-bold text-foreground">{renderTitle()}</h2>
          <p className="text-muted-foreground mt-1">{renderSubtitle()}</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === 'register' && (
            <div className="space-y-2">
              <Label htmlFor="name" className="text-sm font-medium">
                Nome
              </Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Seu nome"
                  className="h-12 pl-11"
                />
              </div>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="email" className="text-sm font-medium">
              E-mail
            </Label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="seu@email.com"
                className="h-12 pl-11"
              />
            </div>
          </div>

          {mode !== 'forgot' && (
            <div className="space-y-2">
              <Label htmlFor="password" className="text-sm font-medium">
                Senha
              </Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  id="password"
                  name="password"
                  type="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="••••••••"
                  className="h-12 pl-11"
                />
              </div>
            </div>
          )}

          {mode === 'register' && (
            <div className="space-y-2">
              <Label htmlFor="confirmPassword" className="text-sm font-medium">
                Confirmar Senha
              </Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  placeholder="••••••••"
                  className="h-12 pl-11"
                />
              </div>
            </div>
          )}

          {mode === 'login' && (
            <div className="flex justify-end">
              <button
                type="button"
                onClick={() => setMode('forgot')}
                className="text-sm text-primary hover:underline"
              >
                Esqueci minha senha
              </button>
            </div>
          )}

          <Button
            type="submit"
            variant="gradient"
            size="lg"
            className="w-full"
            disabled={loading}
          >
            {loading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : mode === 'login' ? (
              'Entrar'
            ) : mode === 'register' ? (
              'Criar Conta'
            ) : (
              'Enviar Link'
            )}
          </Button>
        </form>

        {mode === 'login' && (
          <div className="mt-6 text-center">
            <p className="text-sm text-muted-foreground">
              Ainda não tem conta?{' '}
              <button
                onClick={() => setMode('register')}
                className="text-primary font-semibold hover:underline"
              >
                Criar conta grátis
              </button>
            </p>
          </div>
        )}
      </div>

      {/* Footer */}
      <p className="mt-8 text-xs text-muted-foreground animate-fade-in" style={{ animationDelay: '200ms' }}>
        Seus dados estão protegidos com criptografia de ponta a ponta.
      </p>
    </div>
  );
};

export default Auth;
