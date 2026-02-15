import { buildServer } from '../server/src/index.js';

let app: any = null;

const getServer = async () => {
  if (!app) {
    app = buildServer();
    await app.ready();
  }
  return app;
};

export default async function handler(req: any, res: any) {
  try {
    const server = await getServer();
    server.server.emit('request', req, res);
  } catch (error: any) {
    console.error('Serverless handler error:', error);
    res.statusCode = 500;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({ 
      error: 'Internal Server Error',
      message: error?.message || 'Unknown error'
    }));
  }
}
