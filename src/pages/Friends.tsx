import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { UserSession, GoalWithProgress } from '@/lib/types';
import { getFriends, addFriend, getFriendGoals, Friend } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { GoalCard } from '@/components/GoalCard';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import { toast } from 'sonner';
import { ArrowLeft, UserPlus, Users, X } from 'lucide-react';

export const Friends = () => {
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const storedUser = localStorage.getItem('user');
    const user: UserSession | null = storedUser ? JSON.parse(storedUser) : null;

    const [isAddOpen, setIsAddOpen] = useState(false);
    const [emailToAdd, setEmailToAdd] = useState('');
    const [selectedFriend, setSelectedFriend] = useState<Friend | null>(null);

    // Redirect if not logged in
    if (!user?.token) {
        navigate('/auth');
        return null;
    }

    // Fetch Friends
    const { data: friends = [], isLoading } = useQuery({
        queryKey: ['friends', user?.email],
        queryFn: () => getFriends(user as UserSession),
        enabled: !!user?.token,
    });

    // Fetch Friend Goals (if friend selected)
    const { data: friendGoals = [], isLoading: isLoadingGoals } = useQuery({
        queryKey: ['friend-goals', selectedFriend?.id],
        queryFn: () => selectedFriend && user ? getFriendGoals(selectedFriend.id, user) : Promise.resolve([]),
        enabled: !!selectedFriend && !!user?.token,
    });

    // Add Friend Mutation
    const addFriendMutation = useMutation({
        mutationFn: (email: string) => addFriend(email, user),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['friends', user.email] });
            setIsAddOpen(false);
            setEmailToAdd('');
            toast.success('Amigo adicionado com sucesso!');
        },
        onError: (err: any) => {
            toast.error(err.message || 'Erro ao adicionar amigo.');
        },
    });

    const handleAddFriend = (e: React.FormEvent) => {
        e.preventDefault();
        if (!emailToAdd) return;
        addFriendMutation.mutate(emailToAdd);
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
                        <h1 className="font-bold text-foreground text-lg">Meus Amigos</h1>
                    </div>
                </div>
            </header>

            <main className="container max-w-2xl mx-auto px-4 py-6 space-y-6">
                {/* Actions */}
                <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2 text-muted-foreground">
                        <Users className="w-5 h-5" />
                        <span className="text-sm font-medium">{friends.length} amigos</span>
                    </div>

                    <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
                        <DialogTrigger asChild>
                            <Button className="gap-2">
                                <UserPlus className="w-4 h-4" />
                                Adicionar
                            </Button>
                        </DialogTrigger>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>Adicionar Amigo</DialogTitle>
                            </DialogHeader>
                            <form onSubmit={handleAddFriend} className="space-y-4 pt-4">
                                <div className="space-y-2">
                                    <label htmlFor="email" className="text-sm font-medium">
                                        E-mail do amigo
                                    </label>
                                    <Input
                                        id="email"
                                        type="email"
                                        placeholder="exemplo@email.com"
                                        value={emailToAdd}
                                        onChange={(e) => setEmailToAdd(e.target.value)}
                                        required
                                    />
                                </div>
                                <Button type="submit" className="w-full" disabled={addFriendMutation.isPending}>
                                    {addFriendMutation.isPending ? 'Adicionando...' : 'Adicionar Amigo'}
                                </Button>
                            </form>
                        </DialogContent>
                    </Dialog>
                </div>

                {/* Friends List */}
                {isLoading ? (
                    <div className="text-center py-8 text-muted-foreground">Carregando...</div>
                ) : friends.length > 0 ? (
                    <div className="grid gap-3">
                        {friends.map((friend) => (
                            <div
                                key={friend.id}
                                onClick={() => setSelectedFriend(friend)}
                                className="bg-card border border-border/50 rounded-xl p-4 flex items-center justify-between cursor-pointer hover:bg-secondary/50 transition-colors"
                            >
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                                        {friend.name.charAt(0).toUpperCase()}
                                    </div>
                                    <div>
                                        <h3 className="font-semibold text-foreground">{friend.name}</h3>
                                        <p className="text-xs text-muted-foreground">{friend.email}</p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-12 bg-secondary/20 rounded-xl border border-dashed border-border">
                        <Users className="w-12 h-12 mx-auto text-muted-foreground mb-3" />
                        <h3 className="font-semibold text-foreground">Nenhum amigo ainda</h3>
                        <p className="text-sm text-muted-foreground mb-4">
                            Adicione amigos para ver as metas deles!
                        </p>
                        <Button variant="outline" onClick={() => setIsAddOpen(true)}>
                            Adicionar agora
                        </Button>
                    </div>
                )}
            </main>

            {/* Friend Goals Drawer/Modal */}
            <Dialog open={!!selectedFriend} onOpenChange={(open) => !open && setSelectedFriend(null)}>
                <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>Metas de {selectedFriend?.name}</DialogTitle>
                    </DialogHeader>

                    <div className="space-y-4 pt-4">
                        {isLoadingGoals ? (
                            <div className="text-center py-8">Carregando metas...</div>
                        ) : friendGoals.length > 0 ? (
                            friendGoals.map((goal) => (
                                <div key={goal.id} className="opacity-90 hover:opacity-100 transition-opacity">
                                    <GoalCard
                                        goal={goal}
                                        onClick={() => { }} // No interaction
                                    // No add transaction button passed
                                    />
                                </div>
                            ))
                        ) : (
                            <div className="text-center py-8 text-muted-foreground">
                                Este amigo não tem metas ativas visíveis.
                            </div>
                        )}
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default Friends;
