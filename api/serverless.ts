import { buildServer } from '../server/src/index.js';
import { FastifyRequest, FastifyReply } from 'fastify';

const app = buildServer();

export default async function handler(req: any, res: any) {
    await app.ready();
    app.server.emit('request', req, res);
}
