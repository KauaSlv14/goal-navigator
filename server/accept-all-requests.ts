
import { prisma } from './src/db.js';

async function main() {
    console.log('=== Accepting ALL pending friend requests manually ===\n');

    const pending = await prisma.friendship.findMany({
        where: { status: 'PENDING' },
        include: {
            user: { select: { id: true, email: true } },
            friend: { select: { id: true, email: true } }
        }
    });

    for (const request of pending) {
        console.log(`Processing: ${request.user.email} -> ${request.friend.email}`);

        // Update to ACCEPTED
        await prisma.friendship.update({
            where: { id: request.id },
            data: { status: 'ACCEPTED' }
        });

        // Create reverse friendship if not exists
        const reverse = await prisma.friendship.findUnique({
            where: {
                userId_friendId: {
                    userId: request.friendId,
                    friendId: request.userId
                }
            }
        });

        if (reverse) {
            await prisma.friendship.update({
                where: { id: reverse.id },
                data: { status: 'ACCEPTED' }
            });
            console.log('  -> Updated both directions to ACCEPTED');
        } else {
            await prisma.friendship.create({
                data: {
                    userId: request.friendId,
                    friendId: request.userId,
                    status: 'ACCEPTED'
                }
            });
            console.log('  -> Created reverse friendship and set to ACCEPTED');
        }
    }

    console.log('\n=== Done! All requests accepted. ===');
}

main()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
