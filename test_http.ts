import { prisma } from './server/src/db.js';
import jwt from 'jsonwebtoken';
import { env } from './server/src/env.js';

async function main() {
    const user = await prisma.user.findFirst({ where: { email: 'demo@goal.local' } });
    if (!user) return;

    const goal = await prisma.goal.findFirst({ where: { userId: user.id } });
    if (!goal) return;

    const token = jwt.sign({ sub: user.id, email: user.email, name: user.name }, env.jwtSecret, { expiresIn: '7d' });

    console.log("Token:", token);

    const res = await fetch(`http://127.0.0.1:3333/api/goals/${goal.id}/transactions`, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            amount: 25,
            type: 'pix',
            category: 'entrada',
            description: 'Test API direct'
        })
    });

    console.log("Status:", res.status);
    const body = await res.text();
    console.log("Body:", body);
}

main().catch(console.error);
