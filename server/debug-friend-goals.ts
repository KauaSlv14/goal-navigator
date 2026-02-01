
import { prisma } from './src/db.js';
import { calculateGoalProgress } from './src/utils/format.js';
import { getFriendGoals } from './src/services/friendService.js';

async function main() {
    console.log('=== DEBUG FRIEND GOALS ===');

    // 1. Get Users
    const users = await prisma.user.findMany({ select: { id: true, email: true } });
    console.log('\nUsers:');
    users.forEach(u => console.log(`  ${u.email} (${u.id})`));

    // 2. Get Friendships
    const friendships = await prisma.friendship.findMany({
        where: { status: 'ACCEPTED' },
        include: { user: true, friend: true }
    });
    console.log('\nFriendships (ACCEPTED):');
    friendships.forEach(f => {
        console.log(`  ${f.user.email} <-> ${f.friend.email}`);
    });

    if (friendships.length === 0) {
        console.log('No accepted friendships found.');
        return;
    }

    // 3. Pick the first friendship to test
    const f = friendships[0];
    const me = f.userId;
    const friend = f.friendId;

    console.log(`\nTesting getFriendGoals for:`);
    console.log(`  Me: ${f.user.email} (${me})`);
    console.log(`  Friend: ${f.friend.email} (${friend})`);

    try {
        const goals = await getFriendGoals(friend, me);
        console.log(`\nFound ${goals.length} goals for friend ${f.friend.email}`);

        goals.forEach((g: any) => {
            console.log(`\n  Goal: ${g.name} (${g.id})`);
            console.log(`    Target: ${g.targetAmount}`);
            console.log(`    Initial Cash: ${g.initialCash}`);
            console.log(`    Initial Pix: ${g.initialPix}`);
            console.log(`    Total Current (Calc): ${g.totalCurrent}`);
            console.log(`    Percentage (Calc): ${g.percentage}%`);
            console.log(`    Transactions: ${g.transactions ? g.transactions.length : 'UNDEFINED'}`);

            if (g.transactions && g.transactions.length > 0) {
                g.transactions.forEach((t: any, idx: number) => {
                    console.log(`      [${idx}] ${t.type} / ${t.category}: ${t.amount} (${t.createdAt})`);
                });
            } else {
                console.log('      (No transactions)');
            }
        });

    } catch (err: any) {
        console.error('Error fetching friend goals:', err.message);
    }
}

main()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
