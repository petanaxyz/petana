import { useQuery } from '@tanstack/react-query';
import { useEffect } from 'react';
import { useAgentStore } from '../store/agents.store';
import type { Agent } from '../types';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

export function useAgents(walletAddress: string | null) {
  const setAgents = useAgentStore((s) => s.setAgents);

  const query = useQuery<Agent[]>({
    queryKey: ['agents', walletAddress],
    queryFn: async () => {
      if (!walletAddress) return [];
      const res = await fetch(`${API_URL}/wallet/${walletAddress}/agents`);
      if (!res.ok) throw new Error('Failed to fetch agents');
      return res.json();
    },
    enabled: !!walletAddress,
    refetchInterval: 30_000,
    staleTime: 10_000,
  });

  useEffect(() => {
    if (query.data) setAgents(query.data);
  }, [query.data, setAgents]);

  return query;
}
