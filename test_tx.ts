import { prisma } from './server/src/db.js';
import { addTransactionToGoal } from './server/src/services/goalService.js';

async function main() {
    const user = await prisma.user.findFirst({ where: { email: 'demo@goal.local' } });
    if (!user) {
        console.log("No user");
        return;
    }

    const goal = await prisma.goal.findFirst({ where: { userId: user.id } });
    if (!goal) {
        console.log("no goal");
        return;
    }

    console.log(`Using goal: ${goal.id}`);

    try {
        const tx = await addTransactionToGoal(goal.id, user.email, {
            amount: 15,
            type: 'pix',
            category: 'entrada',
            description: 'Test API direct',
        }, user.name);

        console.log("Service success:", tx);
    } catch (err: any) {
        console.error("Service error:", err.message);
    }
}

main().catch(console.error).finally(() => prisma.$disconnect());
