
import { prisma } from './src/db';
import { addFriend, acceptRequest, listRequests, listSentRequests } from './src/services/friendService';
import fs from 'fs';

const log = (msg: any) => {
    console.log(msg);
    fs.appendFileSync('server/debug-output.txt', JSON.stringify(msg, null, 2) + '\n');
};

async function main() {
    fs.writeFileSync('server/debug-output.txt', '');
    log('--- Debugging ZKA Accept Logic ---');

    const zkaId = 'e8076fac-e1b2-4589-afb6-f17108c42b2f';
    const testerId = 'e7bcc184-ec94-4775-bf61-722237dae55b';
    const requestId = '1c005dfc-0f4b-408f-a839-b3559a26d89a';

    log(`Acting as ZKA (${zkaId})`);

    // 1. Verify Request exists
    const req = await prisma.friendship.findUnique({ where: { id: requestId } });
    log('Request in DB:');
    log(req);

    if (!req) {
        log('Request NOT FOUND.');
        return;
    }

    if (req.friendId !== zkaId) {
        log(`Mismatch! req.friendId (${req.friendId}) !== zkaId (${zkaId})`);
    }

    // 2. Try Accept
    log('\n--> Attempting to Accept Request...');
    try {
        const res = await acceptRequest(requestId, zkaId);
        log('Accept Result:');
        log(res);
    } catch (e: any) {
        log('Accept Error: ' + e.message);
        // Log stack trace if possible
        log(e.stack);
    }
}

main()
    .catch(e => {
        console.error(e);
        fs.appendFileSync('server/debug-output.txt', 'CRITICAL ERROR: ' + e.message);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
