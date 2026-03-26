export type AgentType = 'trading' | 'dev' | 'social' | 'defi' | 'onchain';
export type PetType   = 'dog' | 'cat' | 'bird' | 'fish' | 'hamster';
export type AgentStatus = 'working' | 'idle' | 'hungry' | 'sleeping';
export type TaskType  = 'trade' | 'commit' | 'post' | 'swap' | 'battle';

export interface AgentCreateInput {
  name: string;
  type: AgentType;
  petType: PetType;
  description?: string;
  ownerWallet: string;
}

export interface TaskPayload {
  type: TaskType;
  payload: Record<string, unknown>;
}

export interface WsEvent {
  type: 'hp_update' | 'xp_update' | 'level_up' | 'quest_complete' | 'battle_result' | 'evolved';
  agentId: string;
  hp?: number;
  xp?: number;
  level?: number;
  evolved?: boolean;
  questId?: string;
  battleId?: string;
}
