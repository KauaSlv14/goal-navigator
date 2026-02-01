
import { prisma } from './src/db.js';
import { getFriendGoals } from './src/services/friendService.js';
import { calculateGoalProgress } from './src/utils/format.js';

async function main() {
    console.log('=== DEBUG TRANSACTIONS ===');

    // 1. Find a goal that HAS transactions
    const goalWithTx = await prisma.goal.findFirst({
        where: {
            transactions: { some: {} }
        },
        include: {
            user: true,
            transactions: true
        }
    });

    if (!goalWithTx) {
        console.log('No goals with transactions found in the DATABASE.');
        return;
    }

    const owner = goalWithTx.user;
    console.log(`Found Goal with transactions:`);
    console.log(`  Goal ID: ${goalWithTx.id}`);
    console.log(`  Owner: ${owner.email} (${owner.id})`);
    console.log(`  Transactions count: ${goalWithTx.transactions.length}`);

    // 2. Find a friend of this owner
    const friendship = await prisma.friendship.findFirst({
        where: {
            friendId: owner.id,
            status: 'ACCEPTED'
        },
        include: { user: true }
    });

    if (!friendship) {
        console.log('This owner has no friends who have accepted them.');
        // Create a temporary friendship for debugging? Or just warn.
        // Let's check reverse too
        const reverse = await prisma.friendship.findFirst({
            where: { userId: owner.id, status: 'ACCEPTED' },
            include: { friend: true }
        });
        if (reverse) {
            console.log(`(But they are friends with ${reverse.friend.email}, maybe check that direction?)`);
        }
        return;
    }

    const viewer = friendship.user;
    console.log(`Viewer (Friend): ${viewer.email} (${viewer.id})`);

    // 3. Call Service
    console.log('\n--- Calling getFriendGoals ---');
    try {
        const goals = await getFriendGoals(owner.id, viewer.id);
        const targetGoal = goals.find(g => g.id === goalWithTx.id);

        if (targetGoal) {
            console.log(`Goal Found in Service Response:`);
            console.log(`  Name: ${targetGoal.name}`);
            console.log(`  Transactions in response: ${targetGoal.transactions ? targetGoal.transactions.length : 'UNDEFINED'}`);

            // Check Progress Calculation
            const calc = calculateGoalProgress(targetGoal as any);
            console.log(`  Progress: ${calc.percentage}%`);
            console.log(`  Total Current: ${calc.totalCurrent}`);

            // Dump raw transactions
            console.log('\n  Transactions Detail:');
            targetGoal.transactions?.forEach(t => {
                console.log(`    ${t.type}/${t.category}: ${t.amount}`);
            });
        } else {
            console.log('Goal NOT found in service response (maybe completed?).');
        }

    } catch (err: any) {
        console.error('Service Error:', err.message);
    }
}

main()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
