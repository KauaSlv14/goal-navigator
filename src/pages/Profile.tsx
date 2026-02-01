
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
    const [avatarFile, setAvatarFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState(user?.avatarUrl || '');

    useEffect(() => {
        if (!user?.token) {
            navigate('/auth');
        }
    }, [user, navigate]);

    const updateProfileMutation = useMutation({
        mutationFn: (data: { name: string; avatarFile: File | null }) =>
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
        updateProfileMutation.mutate({ name, avatarFile });
    };

    const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setAvatarFile(file);
            // Create a preview URL
            const url = URL.createObjectURL(file);
            setPreviewUrl(url);
        }
    };

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
                            <div className="relative group cursor-pointer" onClick={() => fileInputRef.current?.click()}>
                                <div className="w-32 h-32 rounded-full border-4 border-background shadow-xl overflow-hidden bg-secondary relative">
                                    {previewUrl ? (
                                        <img
                                            src={previewUrl}
                                            alt="Preview"
                                            className="w-full h-full object-cover transition-opacity group-hover:opacity-75"
                                            onError={() => setPreviewUrl('')}
                                        />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-muted-foreground bg-muted group-hover:bg-muted/80 transition-colors">
                                            <User className="w-12 h-12" />
                                        </div>
                                    )}
                                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                        <Camera className="w-8 h-8 text-white drop-shadow-md" />
                                    </div>
                                </div>
                            </div>

                            <input
                                type="file"
                                ref={fileInputRef}
                                className="hidden"
                                accept="image/*"
                                onChange={handleAvatarChange}
                            />

                            <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => fileInputRef.current?.click()}
                            >
                                <Camera className="w-4 h-4 mr-2" />
                                Alterar Foto
                            </Button>
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
