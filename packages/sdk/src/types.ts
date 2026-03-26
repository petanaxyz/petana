export type AgentType   = 'trading' | 'dev' | 'social' | 'defi' | 'onchain';
export type PetType     = 'dog' | 'cat' | 'bird' | 'fish' | 'hamster';
export type AgentStatus = 'working' | 'idle' | 'hungry' | 'sleeping';
export type TaskType    = 'trade' | 'commit' | 'post' | 'swap' | 'battle';
export type Network     = 'mainnet' | 'devnet';

export interface PetanaConfig {
  walletAddress: string;
  network?: Network;
  /** Override API base URL (for self-hosting) */
  apiUrl?: string;
}

export interface AgentConfig {
  name: string;
  type: AgentType;
  petType: PetType;
  description?: string;
}

export interface Agent {
  id:          string;
  name:        string;
  type:        AgentType;
  petType:     PetType;
  description: string | null;
  ownerWallet: string;
  hp:          number;
  maxHp:       number;
  xp:          number;
  level:       number;
  status:      AgentStatus;
  evolved:     boolean;
  lastTaskAt:  string | null;
  createdAt:   string;
}

export interface TaskPayload {
  type: TaskType;
  payload: Record<string, unknown>;
}

export interface TaskResult {
  agent:    Agent;
  xpGained: number;
  hpBefore: number;
  hpAfter:  number;
  quest:    Quest;
}

export interface Quest {
  id:        string;
  agentId:   string;
  type:      TaskType;
  payload:   Record<string, unknown>;
  xpGained:  number;
  hpChange:  number;
  txHash:    string | null;
  createdAt: string;
}

export interface WsEvent {
  type:      'connected' | 'hp_update' | 'xp_update' | 'level_up' | 'quest_complete' | 'battle_result' | 'evolved';
  agentId?:  string;
  hp?:       number;
  xp?:       number;
  level?:    number;
  evolved?:  boolean;
  questId?:  string;
}
