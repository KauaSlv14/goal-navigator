import https from 'https';
import fs from 'fs';
import path from 'path';

function downloadImage(url, dest) {
    return new Promise((resolve, reject) => {
        const file = fs.createWriteStream(dest);
        https.get(url, (response) => {
            response.pipe(file);
            file.on('finish', () => {
                file.close(resolve);
            });
        }).on('error', (err) => {
            fs.unlink(dest, () => reject(err));
        });
    });
}

async function run() {
    console.log('Downloading 192x192 icon...');
    await downloadImage('https://placehold.co/192x192/000000/FFFFFF/png?text=GN', path.join(process.cwd(), 'public', 'pwa-192x192.png'));
    console.log('Downloading 512x512 icon...');
    await downloadImage('https://placehold.co/512x512/000000/FFFFFF/png?text=GN', path.join(process.cwd(), 'public', 'pwa-512x512.png'));
    console.log('Done.');
}

run();
