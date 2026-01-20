import { FastifyInstance } from 'fastify';
import { z } from 'zod';
import jwt from 'jsonwebtoken';
import { env } from '../env';
import { addFriend, listFriends, getFriendGoals } from '../services/friendService';

const getUserFromAuth = (authorization?: string) => {
    if (!authorization) return null;
    const parts = authorization.split(' ');
    if (parts.length !== 2 || parts[0] !== 'Bearer') return null;
    const token = parts[1];
    try {
        const payload = jwt.verify(token, env.jwtSecret) as { sub: string; email: string; name?: string };
        return payload;
    } catch {
        return null;
    }
};

export async function friendsRoutes(app: FastifyInstance) {
    // Add friend
    app.post('/', async (request, reply) => {
        const user = getUserFromAuth(request.headers.authorization);
        if (!user) {
            return reply.code(401).send({ error: 'Não autorizado' });
        }

        try {
            const userId = user.sub;
            const createFriendSchema = z.object({
                email: z.string().email(),
            });

            const body = createFriendSchema.parse(request.body);

            const friendship = await addFriend({
                email: body.email,
                userId,
            });

            return reply.status(201).send(friendship);
        } catch (err: any) {
            return reply.status(400).send({ error: err.message });
        }
    });

    // List friends
    app.get('/', async (request, reply) => {
        const user = getUserFromAuth(request.headers.authorization);
        if (!user) {
            return reply.code(401).send({ error: 'Não autorizado' });
        }

        const userId = user.sub;
        const friends = await listFriends(userId);
        return friends;
    });

    // Get friend's goals
    app.get('/:friendId/goals', async (request, reply) => {
        const user = getUserFromAuth(request.headers.authorization);
        if (!user) {
            return reply.code(401).send({ error: 'Não autorizado' });
        }

        const { friendId } = request.params as { friendId: string };
        const goals = await getFriendGoals(friendId);
        return goals;
    });
}
