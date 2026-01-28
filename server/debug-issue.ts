
import { prisma } from './src/db.js';

async function main() {
    console.log('=== Debug Accept Issue ===\n');

    // Get all pending requests
    const pending = await prisma.friendship.findMany({
        where: { status: 'PENDING' },
        include: {
            user: { select: { id: true, email: true, name: true } },
            friend: { select: { id: true, email: true, name: true } }
        }
    });

    console.log('Pending Requests:');
    pending.forEach(r => {
        console.log(`  ID: ${r.id}`);
        console.log(`    Sender (user): ${r.user.email} (${r.userId})`);
        console.log(`    Receiver (friend): ${r.friend.email} (${r.friendId})`);
        console.log('');
    });

    // List all users
    console.log('\nAll Users:');
    const users = await prisma.user.findMany({ select: { id: true, email: true } });
    users.forEach(u => console.log(`  ${u.email}: ${u.id}`));
}

main().catch(console.error).finally(() => prisma.$disconnect());
