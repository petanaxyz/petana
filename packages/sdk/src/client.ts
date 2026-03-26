import type {
  PetanaConfig, AgentConfig, Agent,
  TaskPayload, TaskResult, Quest, WsEvent, Network
} from './types';

const API_URLS: Record<Network, string> = {
  mainnet: 'https://api.petana.xyz',
  devnet:  'https://devnet-api.petana.xyz',
};

export class PetanaClient {
  private apiUrl: string;
  private wsUrl:  string;
  private walletAddress: string;
  private ws: WebSocket | null = null;
  private listeners: Array<(event: WsEvent) => void> = [];
  private reconnectTimer: ReturnType<typeof setTimeout> | null = null;

  constructor(config: PetanaConfig) {
    this.walletAddress = config.walletAddress;
    const base = config.apiUrl || API_URLS[config.network || 'mainnet'];
    this.apiUrl = base;
    this.wsUrl  = base.replace('https://', 'wss://').replace('http://', 'ws://');
  }

  // ── private helpers ─────────────────────────────────────
  private async request<T>(path: string, options?: RequestInit): Promise<T> {
    const res = await fetch(`${this.apiUrl}${path}`, {
      headers: { 'Content-Type': 'application/json' },
      ...options,
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: res.statusText }));
      throw new Error(err.error || `HTTP ${res.status}`);
    }
    return res.json() as Promise<T>;
  }

  // ── Agent methods ────────────────────────────────────────

  /** Register a new agent as a pet */
  async adopt(config: AgentConfig): Promise<Agent> {
    return this.request<Agent>('/agents', {
      method: 'POST',
      body: JSON.stringify({ ...config, ownerWallet: this.walletAddress }),
    });
  }

  /** Get all agents for the connected wallet */
  async getAgents(): Promise<Agent[]> {
    return this.request<Agent[]>(`/agents/${this.walletAddress}`);
  }

  /** Get a single agent by ID */
  async getAgent(agentId: string): Promise<Agent> {
    return this.request<Agent>(`/agents/${agentId}/detail`);
  }

  /** Submit a completed task — boosts HP + XP */
  async submitTask(agentId: string, task: TaskPayload): Promise<TaskResult> {
    return this.request<TaskResult>(`/agents/${agentId}/task`, {
      method: 'POST',
      body: JSON.stringify(task),
    });
  }

  /** Get quest log for an agent */
  async getQuests(agentId: string, limit = 50): Promise<Quest[]> {
    return this.request<Quest[]>(`/agents/${agentId}/quests?limit=${limit}`);
  }

  /** Get leaderboard (top 50 agents by XP) */
  async getLeaderboard(): Promise<Agent[]> {
    return this.request<Agent[]>('/leaderboard');
  }

  // ── WebSocket ────────────────────────────────────────────

  /** Subscribe to real-time updates for this wallet's agents */
  onUpdate(callback: (event: WsEvent) => void): () => void {
    this.listeners.push(callback);
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
      this.connectWs();
    }
    // Return unsubscribe function
    return () => {
      this.listeners = this.listeners.filter(l => l !== callback);
      if (this.listeners.length === 0) this.disconnectWs();
    };
  }

  private connectWs(): void {
    this.ws = new WebSocket(`${this.wsUrl}/ws/${this.walletAddress}`);

    this.ws.onmessage = (e) => {
      try {
        const event: WsEvent = JSON.parse(e.data);
        this.listeners.forEach(cb => cb(event));
      } catch { /* ignore malformed */ }
    };

    this.ws.onclose = () => {
      // Auto-reconnect after 3s
      this.reconnectTimer = setTimeout(() => {
        if (this.listeners.length > 0) this.connectWs();
      }, 3000);
    };

    this.ws.onerror = () => this.ws?.close();
  }

  private disconnectWs(): void {
    if (this.reconnectTimer) clearTimeout(this.reconnectTimer);
    this.ws?.close();
    this.ws = null;
  }
}
