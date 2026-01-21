import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { UserSession } from '@/lib/types';
import {
    getFriends,
    addFriend,
    getFriendGoals,
    getFriendRequests,
    getSentRequests,
    acceptFriendRequest,
    rejectFriendRequest,
    Friend,
    FriendRequest
} from '@/lib/api';
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
import { ArrowLeft, UserPlus, Users, X, Check, Clock } from 'lucide-react';

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

    // Fetch Friends (Accepted)
    const { data: friends = [], isLoading: isLoadingFriends } = useQuery({
        queryKey: ['friends', user?.email],
        queryFn: () => getFriends(user as UserSession),
        enabled: !!user?.token,
    });

    // Fetch Incoming Requests
    const { data: requests = [], isLoading: isLoadingRequests } = useQuery({
        queryKey: ['friend-requests', user?.email],
        queryFn: () => getFriendRequests(user as UserSession),
        enabled: !!user?.token,
    });

    // Fetch Sent Requests
    const { data: sentRequests = [], isLoading: isLoadingSent } = useQuery({
        queryKey: ['sent-requests', user?.email],
        queryFn: () => getSentRequests(user as UserSession),
        enabled: !!user?.token,
    });

    // Fetch Friend Goals (if friend selected)
    const { data: friendGoals = [], isLoading: isLoadingGoals } = useQuery({
        queryKey: ['friend-goals', selectedFriend?.id],
        queryFn: () => selectedFriend && user ? getFriendGoals(selectedFriend.id, user) : Promise.resolve([]),
        enabled: !!selectedFriend && !!user?.token,
    });

    // Add Friend Mutation (Send Request)
    const addFriendMutation = useMutation({
        mutationFn: (email: string) => addFriend(email, user),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['sent-requests', user.email] });
            setIsAddOpen(false);
            setEmailToAdd('');
            toast.success('Solicitação de amizade enviada!');
        },
        onError: (err: any) => {
            toast.error(err.message || 'Erro ao enviar solicitação.');
        },
    });

    // Accept Request Mutation
    const acceptRequestMutation = useMutation({
        mutationFn: (requestId: string) => acceptFriendRequest(requestId, user),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['friends', user.email] });
            queryClient.invalidateQueries({ queryKey: ['friend-requests', user.email] });
            toast.success('Solicitação aceita!');
        },
        onError: (err: any) => {
            toast.error(err.message || 'Erro ao aceitar solicitação.');
        },
    });

    // Reject Request Mutation
    const rejectRequestMutation = useMutation({
        mutationFn: (requestId: string) => rejectFriendRequest(requestId, user),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['friend-requests', user.email] });
            toast.success('Solicitação recusada.');
        },
        onError: (err: any) => {
            toast.error(err.message || 'Erro ao recusar solicitação.');
        },
    });

    const handleAddFriend = (e: React.FormEvent) => {
        e.preventDefault();
        if (!emailToAdd) return;
        addFriendMutation.mutate(emailToAdd);
    };

    const isLoading = isLoadingFriends || isLoadingRequests || isLoadingSent;

    return (
        <div className="min-h-screen bg-background">
            {/* Header */}
            <header className="sticky top-0 z-40 bg-background/80 backdrop-blur-lg border-b border-border">
                <div className="container max-w-2xl mx-auto px-4 py-4">
                    <div className="flex items-center gap-3">
                        <Button variant="ghost" size="icon" onClick={() => navigate('/dashboard')}>
                            <ArrowLeft className="w-5 h-5" />
                        </Button>
                        <h1 className="font-bold text-foreground text-lg">Amigos</h1>
                    </div>
                </div>
            </header>

            <main className="container max-w-2xl mx-auto px-4 py-6 space-y-8">
                {/* Actions */}
                <div className="flex justify-end">
                    <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
                        <DialogTrigger asChild>
                            <Button className="gap-2">
                                <UserPlus className="w-4 h-4" />
                                Adicionar Amigo
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
                                    {addFriendMutation.isPending ? 'Enviando...' : 'Enviar Solicitação'}
                                </Button>
                            </form>
                        </DialogContent>
                    </Dialog>
                </div>

                {isLoading ? (
                    <div className="text-center py-8 text-muted-foreground">Carregando...</div>
                ) : (
                    <>
                        {/* Solicitações Recebidas */}
                        {requests.length > 0 && (
                            <section className="space-y-3">
                                <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                                    Solicitações Recebidas
                                </h2>
                                <div className="grid gap-3">
                                    {requests.map((req) => (
                                        <div key={req.id} className="bg-card border border-border/50 rounded-xl p-4 flex items-center justify-between">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                                                    {req.sender?.name?.charAt(0).toUpperCase()}
                                                </div>
                                                <div>
                                                    <h3 className="font-semibold text-foreground">{req.sender?.name}</h3>
                                                    <p className="text-xs text-muted-foreground">{req.sender?.email}</p>
                                                </div>
                                            </div>
                                            <div className="flex gap-2">
                                                <Button
                                                    size="icon"
                                                    variant="ghost"
                                                    className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                                                    onClick={() => rejectRequestMutation.mutate(req.id)}
                                                    disabled={rejectRequestMutation.isPending}
                                                >
                                                    <X className="w-4 h-4" />
                                                </Button>
                                                <Button
                                                    size="icon"
                                                    className="h-8 w-8 bg-green-500 hover:bg-green-600 text-white"
                                                    onClick={() => acceptRequestMutation.mutate(req.id)}
                                                    disabled={acceptRequestMutation.isPending}
                                                >
                                                    <Check className="w-4 h-4" />
                                                </Button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </section>
                        )}

                        {/* Solicitações Enviadas */}
                        {sentRequests.length > 0 && (
                            <section className="space-y-3">
                                <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                                    Solicitações Enviadas
                                </h2>
                                <div className="grid gap-3">
                                    {sentRequests.map((req) => (
                                        <div key={req.id} className="bg-card border border-border/50 rounded-xl p-4 flex items-center justify-between opacity-75">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center text-muted-foreground font-bold">
                                                    {req.friend?.name?.charAt(0).toUpperCase()}
                                                </div>
                                                <div>
                                                    <h3 className="font-semibold text-foreground">{req.friend?.name}</h3>
                                                    <p className="text-xs text-muted-foreground">{req.friend?.email}</p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-2 text-muted-foreground text-xs bg-secondary/50 px-2 py-1 rounded-full">
                                                <Clock className="w-3 h-3" />
                                                Pendente
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </section>
                        )}

                        {/* Meus Amigos */}
                        <section className="space-y-3">
                            <div className="flex items-center justify-between">
                                <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                                    Meus Amigos
                                </h2>
                                <span className="text-xs text-muted-foreground">{friends.length} amigos</span>
                            </div>

                            {friends.length > 0 ? (
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
                                    <h3 className="font-semibold text-foreground">Sua lista de amigos está vazia</h3>
                                    <p className="text-sm text-muted-foreground">
                                        Adicione amigos para acompanhar suas metas!
                                    </p>
                                </div>
                            )}
                        </section>
                    </>
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
                                        onClick={() => { }}
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
