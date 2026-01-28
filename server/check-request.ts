
import { prisma } from './src/db.js';
import * as fs from 'fs';

async function main() {
    const result: string[] = [];

    // Get all users
    const users = await prisma.user.findMany({
        select: { id: true, email: true, name: true }
    });

    result.push('=== USERS ===');
    users.forEach(u => result.push(`${u.id} | ${u.email}`));

    result.push('\n=== PENDING FRIENDSHIPS (incoming requests) ===');
    const pending = await prisma.friendship.findMany({
        where: { status: 'PENDING' },
        include: {
            user: { select: { email: true } },
            friend: { select: { email: true } }
        }
    });

    pending.forEach(f => {
        result.push(`Request ID: ${f.id}`);
        result.push(`  FROM: ${f.user.email} (userId: ${f.userId})`);
        result.push(`  TO: ${f.friend.email} (friendId: ${f.friendId})`);
        result.push(`  => To accept, the JWT sub must equal: ${f.friendId}`);
        result.push('');
    });

    fs.writeFileSync('server/debug-result.md', result.join('\n'), 'utf8');
    console.log('Written to server/debug-result.md');
}

main()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
