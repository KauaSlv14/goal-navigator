import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Target, Mail, Lock, User, ArrowLeft, Loader2 } from 'lucide-react';
import { StaircaseUp } from '@/components/icons/StaircaseUp';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import { login, register } from '@/lib/api';
import { UserSession } from '@/lib/types';

type AuthMode = 'login' | 'register' | 'forgot';

export const Auth = () => {
  const navigate = useNavigate();
  const [mode, setMode] = useState<AuthMode>('login');

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
    } else if (mode === 'login' && !formData.password) {
      toast.error('Digite sua senha');
      setLoading(false);
      return;
    }

    try {
      if (mode === 'forgot') {
        toast.info('Fluxo de recuperação ainda não implementado.');
        setMode('login');
      } else if (mode === 'register') {
        const response = await register({
          email: formData.email,
          password: formData.password,
          name: formData.name || formData.email.split('@')[0],
        });
        localStorage.setItem(
          'user',
          JSON.stringify({
            id: response.user.id,
            email: response.user.email,
            name: response.user.name,
            avatarUrl: response.user.avatarUrl,
            token: response.token
          })
        );
        toast.success('Conta criada com sucesso!');
        navigate('/dashboard');
      } else {
        const response = await login({
          email: formData.email,
          password: formData.password,
        });
        localStorage.setItem(
          'user',
          JSON.stringify({
            id: response.user.id,
            email: response.user.email,
            name: response.user.name,
            avatarUrl: response.user.avatarUrl,
            token: response.token
          })
        );
        toast.success('Login realizado com sucesso!');
        navigate('/dashboard');
      }
    } catch (err: any) {
      const message = err?.message || 'Falha na autenticação';
      toast.error(message);
    } finally {
      setLoading(false);
    }
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
    <div className="min-h-[100dvh] bg-background flex flex-col items-center justify-center p-4 relative overflow-hidden pb-[env(safe-area-inset-bottom)] pt-[env(safe-area-inset-top)]">
      {/* Background Pattern */}
      <div className="absolute inset-0 -z-10 bg-grid-pattern opacity-[0.03] pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary/5 rounded-full blur-3xl pointer-events-none animate-pulse-glow" />

      {/* Logo */}
      <div className="flex flex-col items-center gap-4 mb-8 animate-fade-in-up md:flex-row md:gap-3">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-emerald-400 flex items-center justify-center shadow-lg shadow-emerald-500/20 ring-1 ring-white/10 group">
          <StaircaseUp className="w-8 h-8 text-white transition-transform duration-500 group-hover:scale-110 group-hover:rotate-12" />
        </div>
        <div className="text-center md:text-left">
          <h1 className="text-3xl font-extrabold text-foreground tracking-tight">Cofre de Metas</h1>
          <p className="text-sm text-muted-foreground font-medium">Seus sonhos, seu controle</p>
        </div>
      </div>

      {/* Auth Card */}
      <div className="w-full max-w-md card-premium p-8 animate-fade-in-up backdrop-blur-xl border-white/10" style={{ animationDelay: '100ms' }}>
        {mode !== 'login' && (
          <button
            onClick={() => setMode('login')}
            className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors mb-6 group"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            Voltar ao login
          </button>
        )}

        <div className="mb-8">
          <h2 className="text-2xl font-bold text-foreground tracking-tight">{renderTitle()}</h2>
          <p className="text-muted-foreground mt-1 text-sm">{renderSubtitle()}</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {mode === 'register' && (
            <div className="space-y-2">
              <Label htmlFor="name" className="text-sm font-medium">
                Nome
              </Label>
              <div className="relative group">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                <Input
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Seu nome"
                  className="h-12 pl-11 bg-secondary/50 border-border/50 focus:bg-background transition-all"
                />
              </div>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="email" className="text-sm font-medium">
              E-mail
            </Label>
            <div className="relative group">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
              <Input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="seu@email.com"
                className="h-12 pl-11 bg-secondary/50 border-border/50 focus:bg-background transition-all"
              />
            </div>
          </div>

          {mode !== 'forgot' && (
            <div className="space-y-2">
              <Label htmlFor="password" className="text-sm font-medium">
                Senha
              </Label>
              <div className="relative group">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                <Input
                  id="password"
                  name="password"
                  type="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="••••••••"
                  className="h-12 pl-11 bg-secondary/50 border-border/50 focus:bg-background transition-all"
                />
              </div>
            </div>
          )}

          {mode === 'register' && (
            <div className="space-y-2">
              <Label htmlFor="confirmPassword" className="text-sm font-medium">
                Confirmar Senha
              </Label>
              <div className="relative group">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                <Input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  placeholder="••••••••"
                  className="h-12 pl-11 bg-secondary/50 border-border/50 focus:bg-background transition-all"
                />
              </div>
            </div>
          )}

          {mode === 'login' && (
            <div className="flex justify-end">
              <button
                type="button"
                onClick={() => setMode('forgot')}
                className="text-sm text-primary hover:text-primary/80 transition-colors font-medium"
              >
                Esqueci minha senha
              </button>
            </div>
          )}

          <Button
            type="submit"
            className="w-full h-12 btn-premium text-base shadow-lg shadow-emerald-500/20"
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
          <div className="mt-8 text-center pt-6 border-t border-border/50">
            <p className="text-sm text-muted-foreground">
              Ainda não tem conta?{' '}
              <button
                onClick={() => setMode('register')}
                className="text-primary font-bold hover:underline ml-1"
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
