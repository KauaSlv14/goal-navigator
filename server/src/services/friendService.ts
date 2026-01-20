import { prisma } from '../db';
import { calculateGoalProgress } from '../utils/format';

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

    // Check if already friends
    const existingFriendship = await prisma.friendship.findUnique({
        where: {
            userId_friendId: {
                userId,
                friendId: friend.id,
            },
        },
    });

    if (existingFriendship) {
        throw new Error('Este usuário já é seu amigo.');
    }

    // Create friendship (following)
    const friendship = await prisma.friendship.create({
        data: {
            userId,
            friendId: friend.id,
        },
        include: {
            friend: {
                select: {
                    id: true,
                    name: true,
                    email: true,
                },
            },
        },
    });

    return friendship;
};

export const listFriends = async (userId: string) => {
    const friendships = await prisma.friendship.findMany({
        where: { userId },
        include: {
            friend: {
                select: {
                    id: true,
                    name: true,
                    email: true,
                },
            },
        },
        orderBy: { createdAt: 'desc' },
    });

    return friendships.map(f => f.friend);
};

export const getFriendGoals = async (friendId: string) => {
    const goals = await prisma.goal.findMany({
        where: {
            userId: friendId,
            isCompleted: false, // Only show active goals? Or all? Let's show active for now.
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
            ...progress,
        };
    });
};
