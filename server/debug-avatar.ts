
import { prisma } from './src/db.js';
import fs from 'fs';
import path from 'path';

async function main() {
    console.log('=== DEBUG AVATAR ===');

    // Check users
    const users = await prisma.user.findMany({
        select: { id: true, email: true, name: true, avatarUrl: true }
    });

    console.log('Users:', JSON.stringify(users, null, 2));

    // Check uploads folder
    const uploadsDir = path.join(process.cwd(), 'server', 'uploads');
    if (fs.existsSync(uploadsDir)) {
        const files = fs.readdirSync(uploadsDir);
        console.log(`Uploads folder (${uploadsDir}) contains ${files.length} files:`);
        files.forEach(f => console.log(` - ${f} (${fs.statSync(path.join(uploadsDir, f)).size} bytes)`));
    } else {
        console.log(`Uploads folder DOES NOT EXIST at ${uploadsDir}`);
    }
}

main();
