import { useEffect, useRef } from 'react';
import { useAgentStore } from '../store/agents.store';
import type { WsEvent } from '../types';

const WS_URL = import.meta.env.VITE_WS_URL || 'ws://localhost:3001';

export function useRealtimeFeed(walletAddress: string | null) {
  const updateAgent = useAgentStore((s) => s.updateAgent);
  const wsRef = useRef<WebSocket | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!walletAddress) return;

    function connect() {
      const ws = new WebSocket(`${WS_URL}/ws/${walletAddress}`);
      wsRef.current = ws;

      ws.onopen = () => {
        console.log('🐾 PETANA WS connected');
      };

      ws.onmessage = (e) => {
        try {
          const event: WsEvent = JSON.parse(e.data);

          if (!event.agentId) return;

          switch (event.type) {
            case 'hp_update':
              updateAgent(event.agentId, { hp: event.hp });
              break;
            case 'xp_update':
              updateAgent(event.agentId, { xp: event.xp });
              break;
            case 'level_up':
              updateAgent(event.agentId, { level: event.level });
              break;
            case 'evolved':
              updateAgent(event.agentId, { evolved: true });
              break;
          }
        } catch { /* ignore */ }
      };

      ws.onclose = () => {
        // Auto-reconnect after 3s
        timerRef.current = setTimeout(connect, 3000);
      };

      ws.onerror = () => ws.close();
    }

    connect();

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      wsRef.current?.close();
    };
  }, [walletAddress, updateAgent]);
}
