import Fastify from 'fastify';
import fastifyCors from '@fastify/cors';
import fastifyWs from '@fastify/websocket';
import { agentRoutes } from './routes/agents';
import { healthRoutes } from './routes/health';
import { registerWs } from './ws/handler';

export async function buildServer() {
  const server = Fastify({
    logger: {
      level: process.env.NODE_ENV === 'production' ? 'warn' : 'info',
    },
  });

  // Plugins
  await server.register(fastifyCors, {
    origin: [
      process.env.FRONTEND_URL || 'http://localhost:5173',
      'http://localhost:3000',
    ],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    credentials: true,
  });

  await server.register(fastifyWs);

  // Routes
  await server.register(healthRoutes);
  await server.register(agentRoutes);

  // WebSocket
  registerWs(server);

  return server;
}
