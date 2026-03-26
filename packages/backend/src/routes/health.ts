import type { FastifyInstance } from 'fastify';
import { getConnectedCount } from '../ws/handler';

export async function healthRoutes(server: FastifyInstance): Promise<void> {
  server.get('/health', async (_req, reply) => {
    return reply.send({
      status: 'ok',
      app: 'petana-backend',
      version: '1.0.0',
      timestamp: new Date().toISOString(),
      wsClients: getConnectedCount(),
    });
  });
}
