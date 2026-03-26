export type AgentType   = 'trading' | 'dev' | 'social' | 'defi' | 'onchain';
export type PetType     = 'dog' | 'cat' | 'bird' | 'fish' | 'hamster';
export type AgentStatus = 'working' | 'idle' | 'hungry' | 'sleeping';
export type TaskType    = 'trade' | 'commit' | 'post' | 'swap' | 'battle';

export interface Agent {
  id:           string;
  name:         string;
  type:         AgentType;
  petType:      PetType;
  description:  string | null;
  ownerWallet:  string;
  hp:           number;
  maxHp:        number;
  xp:           number;
  level:        number;
  status:       AgentStatus;
  evolved:      boolean;
  lastTaskAt:   string | null;
  createdAt:    string;
  xpToNextLevel?: number;
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
  type:     string;
  agentId?: string;
  hp?:      number;
  xp?:      number;
  level?:   number;
  evolved?: boolean;
  questId?: string;
}
