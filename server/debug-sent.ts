
import { prisma } from './src/db.js';
import { listSentRequests } from './src/services/friendService.js';
import fs from 'fs';

async function main() {
    const log = (msg: any) => fs.appendFileSync('server/debug-sent.txt', (typeof msg === 'string' ? msg : JSON.stringify(msg, null, 2)) + '\n');
    fs.writeFileSync('server/debug-sent.txt', '');

    log('--- Debugging Sent Requests ---');
    const email = 'demo@goal.local';
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
        log('User demo not found');
        return;
    }
    log(`User: ${user.email} (${user.id})`);

    const targetEmail = 'gabriel.sbrana@gmail.com';
    log(`\nAttempting to add ${targetEmail}...`);
    try {
        const res = await import('./src/services/friendService.js').then(m => m.addFriend({ email: targetEmail, userId: user.id }));
        log('Add Result:');
        log(res);
    } catch (e: any) {
        log('Add Error: ' + e.message);
    }

    const sent = await listSentRequests(user.id);
    log('Sent Requests:');
    log(sent);

    const allFriendships = await prisma.friendship.findMany({ where: { userId: user.id } });
    log('All Friendships (Raw):');
    log(allFriendships);
}

main().catch(console.error).finally(() => prisma.$disconnect());
