
import { prisma } from './src/db.js';

async function main() {
    console.log('--- Listing All Friendships ---');

    const friendships = await prisma.friendship.findMany({
        include: {
            user: { select: { email: true } },
            friend: { select: { email: true } }
        }
    });

    console.log('Total friendships:', friendships.length);
    friendships.forEach((f: any) => {
        console.log(`  [${f.id}] ${f.user.email} -> ${f.friend.email} | Status: ${f.status}`);
    });

    console.log('\n--- Users in system ---');
    const users = await prisma.user.findMany({ select: { id: true, email: true } });
    users.forEach((u: any) => {
        console.log(`  [${u.id}] ${u.email}`);
    });
}

main()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
