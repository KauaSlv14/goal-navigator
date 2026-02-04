import { prisma } from '../db.js';
import { calculateGoalProgress, decimalToNumber } from '../utils/format.js';



interface FriendInput {
    email: string;
    userId: string;
}

export const addFriend = async ({ email, userId }: FriendInput) => {
    // Find the friend's user account
    const friend = await prisma.user.findUnique({
        where: { email },
    });

    if (!friend) {
        throw new Error('Usuário não encontrado com este e-mail.');
    }

    if (friend.id === userId) {
        throw new Error('Você não pode adicionar a si mesmo.');
    }

    // Check if already friends or request pending
    const existingFriendship = await prisma.friendship.findUnique({
        where: {
            userId_friendId: {
                userId,
                friendId: friend.id,
            },
        },
    });

    if (existingFriendship) {
        if (existingFriendship.status === 'ACCEPTED') {
            throw new Error('Este usuário já é seu amigo.');
        } else {
            throw new Error('Solicitação de amizade já enviada.');
        }
    }

    // Check if there is an incoming request from them (Mutual)
    // If they already requested me, we could auto-accept, but let's stick to explicit flow for now to not confuse.
    // Or better: If I add them and they added me, it becomes accepted.
    const reverseRequest = await prisma.friendship.findUnique({
        where: {
            userId_friendId: {
                userId: friend.id,
                friendId: userId,
            },
        },
    });

    let status: 'PENDING' | 'ACCEPTED' = 'PENDING';

    // Create friendship (request)
    const friendship = await prisma.friendship.create({
        data: {
            userId,
            friendId: friend.id,
            status: 'PENDING',
        },
        include: {
            friend: {
                select: {
                    id: true,
                    name: true,
                    email: true,
                    avatarUrl: true,
                },
            },
        },
    });

    return friendship;
};

export const listFriends = async (userId: string) => {
    const friendships = await prisma.friendship.findMany({
        where: {
            userId,
            status: 'ACCEPTED',
        },
        include: {
            friend: {
                select: {
                    id: true,
                    name: true,
                    email: true,
                    avatarUrl: true,
                },
            },
        },
        orderBy: { createdAt: 'desc' },
    });

    return friendships.map(f => f.friend);
};

export const listSentRequests = async (userId: string) => {
    const requests = await prisma.friendship.findMany({
        where: {
            userId,
            status: 'PENDING',
        },
        include: {
            friend: {
                select: {
                    id: true,
                    name: true,
                    email: true,
                    avatarUrl: true,
                },
            },
        },
        orderBy: { createdAt: 'desc' },
    });

    return requests.map(r => ({
        id: r.id,
        friend: r.friend,
        createdAt: r.createdAt,
    }));
};

export const listRequests = async (userId: string) => {
    // Incoming requests: friendId is ME, status is PENDING
    const requests = await prisma.friendship.findMany({
        where: {
            friendId: userId,
            status: 'PENDING',
        },
        include: {
            user: { // The sender
                select: {
                    id: true,
                    name: true,
                    email: true,
                    avatarUrl: true,
                },
            },
        },
        orderBy: { createdAt: 'desc' },
    });

    return requests.map(r => ({
        id: r.id, // Request ID
        sender: r.user,
        createdAt: r.createdAt,
    }));
};

export const acceptRequest = async (requestId: string, userId: string) => {
    console.log(`[acceptRequest] ==================================`);
    console.log(`[acceptRequest] requestId=${requestId}`);
    console.log(`[acceptRequest] userId from JWT=${userId}`);

    const request = await prisma.friendship.findUnique({
        where: { id: requestId },
        include: {
            user: { select: { email: true } },
            friend: { select: { email: true } },
        },
    });

    if (!request) {
        console.log(`[acceptRequest] ERROR: Request not found: ${requestId}`);
        throw new Error('Solicitação não encontrada.');
    }

    console.log(`[acceptRequest] Request found:`);
    console.log(`   - sender (userId): ${request.userId} (${(request as any).user?.email})`);
    console.log(`   - recipient (friendId): ${request.friendId} (${(request as any).friend?.email})`);
    console.log(`   - status: ${request.status}`);
    console.log(`[acceptRequest] Comparing: request.friendId(${request.friendId}) vs userId(${userId})`);
    console.log(`[acceptRequest] Match: ${request.friendId === userId}`);

    if (request.friendId !== userId) {
        throw new Error('Não autorizado.');
    }

    // 1. Update request to ACCEPTED
    await prisma.friendship.update({
        where: { id: requestId },
        data: { status: 'ACCEPTED' },
    });

    // 2. Create reverse friendship (Me -> Sender) as ACCEPTED
    // Check if it exists first (maybe I sent one too?)
    const reverseExists = await prisma.friendship.findUnique({
        where: {
            userId_friendId: {
                userId,
                friendId: request.userId,
            },
        },
    });

    if (reverseExists) {
        await prisma.friendship.update({
            where: { id: reverseExists.id },
            data: { status: 'ACCEPTED' },
        });
    } else {
        await prisma.friendship.create({
            data: {
                userId,
                friendId: request.userId,
                status: 'ACCEPTED',
            },
        });
    }

    return { ok: true };
};

export const rejectRequest = async (requestId: string, userId: string) => {
    const request = await prisma.friendship.findUnique({
        where: { id: requestId },
    });

    if (!request) {
        throw new Error('Solicitação não encontrada.');
    }

    if (request.friendId !== userId) {
        throw new Error('Não autorizado.');
    }

    await prisma.friendship.delete({
        where: { id: requestId },
    });

    return { ok: true };
};

export const getFriendGoals = async (friendId: string, myUserId: string) => {
    // Check if we are friends (ACCEPTED)
    // We check if I (myUserId) have an ACCEPTED friendship with friendId
    const friendship = await prisma.friendship.findUnique({
        where: {
            userId_friendId: {
                userId: myUserId,
                friendId: friendId,
            },
        },
    });

    if (!friendship || friendship.status !== 'ACCEPTED') {
        throw new Error('Vocês não são amigos.'); // Or return empty array
    }

    const goals = await prisma.goal.findMany({
        where: {
            userId: friendId,
            isCompleted: false,
        },
        include: {
            transactions: true,
            recurringPayments: true,
        },
    });

    // Calculate progress for each goal
    return goals.map(goal => {
        const progress = calculateGoalProgress(goal);
        return {
            ...goal,
            targetAmount: decimalToNumber(goal.targetAmount),
            initialCash: decimalToNumber(goal.initialCash),
            initialPix: decimalToNumber(goal.initialPix),
            transactions: goal.transactions.map(t => ({
                ...t,
                amount: decimalToNumber(t.amount),
            })),
            recurringPayments: goal.recurringPayments.map(p => ({
                ...p,
                amount: decimalToNumber(p.amount),
            })),
            ...progress,
        };
    });
};
