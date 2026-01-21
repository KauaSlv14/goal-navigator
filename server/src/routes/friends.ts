import { FastifyInstance } from 'fastify';
import { z } from 'zod';
import jwt from 'jsonwebtoken';
import { env } from '../env.js';
import { addFriend, listFriends, getFriendGoals, listRequests, acceptRequest, rejectRequest, listSentRequests } from '../services/friendService.js';

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
    // Add friend (Send Request)
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

            // This now acts as "Send Request"
            const friendship = await addFriend({
                email: body.email,
                userId,
            });

            return reply.status(201).send(friendship);
        } catch (err: any) {
            return reply.status(400).send({ error: err.message });
        }
    });

    // List friends (Accepted only)
    app.get('/', async (request, reply) => {
        const user = getUserFromAuth(request.headers.authorization);
        if (!user) {
            return reply.code(401).send({ error: 'Não autorizado' });
        }

        const userId = user.sub;
        const friends = await listFriends(userId);
        return friends;
    });

    // List sent requests (pending)
    app.get('/requests/sent', async (request, reply) => {
        const user = getUserFromAuth(request.headers.authorization);
        if (!user) {
            return reply.code(401).send({ error: 'Não autorizado' });
        }

        const userId = user.sub;
        const requests = await listSentRequests(userId);
        return requests;
    });

    // List pending requests
    app.get('/requests', async (request, reply) => {
        const user = getUserFromAuth(request.headers.authorization);
        if (!user) {
            return reply.code(401).send({ error: 'Não autorizado' });
        }

        const userId = user.sub;
        const requests = await listRequests(userId);
        return requests;
    });

    // Accept request
    app.post('/requests/:id/accept', async (request, reply) => {
        const user = getUserFromAuth(request.headers.authorization);
        if (!user) {
            return reply.code(401).send({ error: 'Não autorizado' });
        }

        const { id } = request.params as { id: string };
        console.log(`[DEBUG] Accepting request ${id} by user ${user.sub} (${user.email})`);

        try {
            await acceptRequest(id, user.sub);
            return reply.send({ ok: true });
        } catch (err: any) {
            console.error('[DEBUG] Accept Error:', err.message);
            return reply.code(400).send({ error: err.message });
        }
    });

    // Reject request
    app.delete('/requests/:id', async (request, reply) => {
        const user = getUserFromAuth(request.headers.authorization);
        if (!user) {
            return reply.code(401).send({ error: 'Não autorizado' });
        }

        const { id } = request.params as { id: string };
        console.log(`[DEBUG] Rejecting request ${id} by user ${user.sub}`);

        try {
            await rejectRequest(id, user.sub);
            return reply.send({ ok: true });
        } catch (err: any) {
            console.error('[DEBUG] Reject Error:', err.message);
            return reply.code(400).send({ error: err.message });
        }
    });


    // Get friend's goals
    app.get('/:friendId/goals', async (request, reply) => {
        const user = getUserFromAuth(request.headers.authorization);
        if (!user) {
            return reply.code(401).send({ error: 'Não autorizado' });
        }

        const { friendId } = request.params as { friendId: string };
        // FIX: Pass BOTH arguments: friendId and myUserId
        const goals = await getFriendGoals(friendId, user.sub);
        return goals;
    });
}
