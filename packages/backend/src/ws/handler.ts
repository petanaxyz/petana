import type { FastifyInstance } from 'fastify';
import type { WsEvent } from '../types';

// Map: walletAddress → Set of connected WebSocket clients
const clients = new Map<string, Set<any>>();

export function registerWs(server: FastifyInstance): void {
  server.get('/ws/:walletAddress', { websocket: true }, (conn, req) => {
    const { walletAddress } = req.params as { walletAddress: string };

    if (!clients.has(walletAddress)) {
      clients.set(walletAddress, new Set());
    }
    clients.get(walletAddress)!.add(conn.socket);

    // Send initial ping
    conn.socket.send(JSON.stringify({ type: 'connected', walletAddress }));

    conn.socket.on('close', () => {
      clients.get(walletAddress)?.delete(conn.socket);
      if (clients.get(walletAddress)?.size === 0) {
        clients.delete(walletAddress);
      }
    });

    conn.socket.on('error', () => {
      clients.get(walletAddress)?.delete(conn.socket);
    });
  });
}

export function broadcast(walletAddress: string, event: WsEvent): void {
  const sockets = clients.get(walletAddress);
  if (!sockets || sockets.size === 0) return;

  const payload = JSON.stringify(event);
  sockets.forEach(ws => {
    try {
      if (ws.readyState === 1) ws.send(payload); // 1 = OPEN
    } catch {
      // ignore broken sockets
    }
  });
}

export function getConnectedCount(): number {
  let total = 0;
  clients.forEach(set => { total += set.size; });
  return total;
}
