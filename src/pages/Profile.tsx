
import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { UserSession } from '@/lib/types';
import { updateProfile } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { ArrowLeft, Camera, User, Save, Loader2 } from 'lucide-react';

export const Profile = () => {
    const navigate = useNavigate();
    const fileInputRef = useRef<HTMLInputElement>(null);
    const storedUser = localStorage.getItem('user');
    const user: UserSession | null = storedUser ? JSON.parse(storedUser) : null;

    const [name, setName] = useState(user?.name || '');
    const [avatarUrl, setAvatarUrl] = useState(user?.avatarUrl || '');
    const [previewUrl, setPreviewUrl] = useState(user?.avatarUrl || '');

    useEffect(() => {
        if (!user?.token) {
            navigate('/auth');
        }
    }, [user, navigate]);

    const updateProfileMutation = useMutation({
        mutationFn: (data: { name: string; avatarUrl: string }) =>
            updateProfile(data, user as UserSession),
        onSuccess: (data) => {
            // Update local storage
            const updatedUser = { ...user, ...data.user, token: user?.token };
            localStorage.setItem('user', JSON.stringify(updatedUser));
            toast.success('Perfil atualizado com sucesso!');
            navigate('/dashboard');
        },
        onError: (err: any) => {
            toast.error(err.message || 'Erro ao atualizar perfil.');
        },
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        updateProfileMutation.mutate({ name, avatarUrl });
    };

    const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        // For now, we are just inputting URL text, but if we wanted file upload:
        // const file = e.target.files?.[0];
        // if (file) { ... }
        // But the requirement implies we might just paste a URL or maybe the user wants real upload?
        // The backend schema supports `avatarUrl` string. 
        // Let's stick to URL input for simplicity as requested "alterar nome adicionar ou trocar foto", 
        // usually implies upload but without an upload server, URL is safer. 
        // However, user experience is better with file upload. 
        // For this iteration, I'll provide a text input for URL but style it nicely.
    };

    // Simplification: We will just use text input for URL for now, 
    // as we don't have an S3/storage bucket set up in the plan.

    return (
        <div className="min-h-screen bg-background">
            {/* Header */}
            <header className="sticky top-0 z-40 bg-background/80 backdrop-blur-lg border-b border-border">
                <div className="container max-w-2xl mx-auto px-4 py-4">
                    <div className="flex items-center gap-3">
                        <Button variant="ghost" size="icon" onClick={() => navigate('/dashboard')}>
                            <ArrowLeft className="w-5 h-5" />
                        </Button>
                        <h1 className="font-bold text-foreground text-lg">Editar Perfil</h1>
                    </div>
                </div>
            </header>

            <main className="container max-w-2xl mx-auto px-4 py-8">
                <div className="card-elevated p-6 animate-fade-in-up">
                    <form onSubmit={handleSubmit} className="space-y-6">

                        {/* Avatar Section */}
                        <div className="flex flex-col items-center space-y-4">
                            <div className="relative group">
                                <div className="w-32 h-32 rounded-full border-4 border-background shadow-xl overflow-hidden bg-secondary">
                                    {previewUrl ? (
                                        <img
                                            src={previewUrl}
                                            alt="Preview"
                                            className="w-full h-full object-cover"
                                            onError={() => setPreviewUrl('')}
                                        />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                                            <User className="w-12 h-12" />
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="w-full max-w-sm">
                                <label className="text-sm font-medium mb-1 block">URL da Foto</label>
                                <Input
                                    placeholder="https://exemplo.com/foto.jpg"
                                    value={avatarUrl}
                                    onChange={(e) => {
                                        setAvatarUrl(e.target.value);
                                        setPreviewUrl(e.target.value);
                                    }}
                                />
                                <p className="text-xs text-muted-foreground mt-1">
                                    Cole o link de uma imagem da internet
                                </p>
                            </div>
                        </div>

                        {/* Name Section */}
                        <div className="space-y-2">
                            <label htmlFor="name" className="text-sm font-medium">Nome</label>
                            <Input
                                id="name"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                placeholder="Seu nome"
                                required
                            />
                        </div>

                        <Button
                            type="submit"
                            className="w-full"
                            size="lg"
                            disabled={updateProfileMutation.isPending}
                        >
                            {updateProfileMutation.isPending ? (
                                <>
                                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                    Salvando...
                                </>
                            ) : (
                                <>
                                    <Save className="w-4 h-4 mr-2" />
                                    Salvar Alterações
                                </>
                            )}
                        </Button>

                    </form>
                </div>
            </main>
        </div>
    );
};

export default Profile;
