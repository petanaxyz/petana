# petana-sdk

Official SDK for [PETANA](https://petana.xyz) — AI Agent monitoring on Solana.

## Install

```bash
npm install petana-sdk
```

## Quick Start

```typescript
import { PetanaClient } from 'petana-sdk';

const petana = new PetanaClient({
  walletAddress: 'YourSolanaWalletAddress...',
  network: 'mainnet', // or 'devnet'
});

// 1. Register your agent as a pet
const agent = await petana.adopt({
  name: 'Rex',
  type: 'trading',   // trading | dev | social | defi | onchain
  petType: 'dog',    // dog | cat | bird | fish | hamster
  description: 'SOL/USDC arbitrage bot',
});

console.log(`🐶 Adopted ${agent.name} — HP: ${agent.hp}, Level: ${agent.level}`);

// 2. Submit completed tasks (boosts HP + earns XP)
await petana.submitTask(agent.id, {
  type: 'trade',
  payload: {
    pair: 'SOL/USDC',
    pnl: 24.5,
    side: 'buy',
    txHash: '5xK...',
  },
});

// 3. Listen for real-time HP/XP updates
const unsubscribe = petana.onUpdate((event) => {
  if (event.type === 'hp_update')  console.log(`HP: ${event.hp}`);
  if (event.type === 'level_up')   console.log(`🎉 Level up! Now Level ${event.level}`);
  if (event.type === 'evolved')    console.log(`👑 EVOLVED!`);
});

// 4. Get all your agents
const agents = await petana.getAgents();

// 5. Get quest log (on-chain history)
const quests = await petana.getQuests(agent.id);

// Cleanup
unsubscribe();
```

## Integration Examples

### LangChain Agent

```typescript
import { PetanaClient } from 'petana-sdk';
import { AgentExecutor } from 'langchain/agents';

const petana = new PetanaClient({ walletAddress: 'YourWallet...' });
const petAgent = await petana.adopt({ name: 'Whisker', type: 'dev', petType: 'cat' });

// Wrap your LangChain agent executor
const originalInvoke = executor.invoke.bind(executor);
executor.invoke = async (input) => {
  const result = await originalInvoke(input);
  // Log every successful invocation as a task
  await petana.submitTask(petAgent.id, {
    type: 'commit',
    payload: { input, output: result.output },
  });
  return result;
};
```

### AutoGen Agent

```typescript
import { PetanaClient } from 'petana-sdk';

const petana = new PetanaClient({ walletAddress: 'YourWallet...' });
const petAgent = await petana.adopt({ name: 'Pip', type: 'social', petType: 'bird' });

// After each message sent
async function onMessageSent(message: string, platform: string) {
  await petana.submitTask(petAgent.id, {
    type: 'post',
    payload: { message, platform, length: message.length },
  });
}
```

## Task Types & HP/XP Values

| Task Type | HP Boost | XP Gained | Use For |
|-----------|----------|-----------|---------|
| `trade`   | +5 HP    | +10 XP    | Trading bots, swaps |
| `commit`  | +4 HP    | +8 XP     | Dev agents, code pushes |
| `post`    | +3 HP    | +5 XP     | Social agents, Twitter/Discord |
| `swap`    | +4 HP    | +10 XP    | DeFi agents, LP operations |
| `battle`  | +8 HP    | +25 XP    | Battle wins |

## HP Decay

Agents lose **2 HP per hour** when idle (no tasks submitted).
Maximum decay: **50 HP** — pets never drop to 0 purely from idling.

| HP Range | Status    |
|----------|-----------|
| 80–100   | Working   |
| 50–79    | Idle      |
| 20–49    | Hungry!   |
| 0–19     | Sleeping  |

## Level System

| Level | XP Required | Notes |
|-------|-------------|-------|
| 1     | 0           | Newborn |
| 2     | 100         | |
| 3     | 250         | |
| 4     | 500         | |
| 5     | 850         | |
| 6     | 1,300       | |
| 7     | 1,900       | |
| 8     | 2,700       | |
| 9     | 3,700       | |
| **10**| **5,000**   | **EVOLUTION 👑** |

## API Reference

```typescript
// Adopt a new agent
petana.adopt(config: AgentConfig): Promise<Agent>

// Get all agents for connected wallet
petana.getAgents(): Promise<Agent[]>

// Get single agent
petana.getAgent(agentId: string): Promise<Agent>

// Submit a task (HP + XP boost + on-chain log)
petana.submitTask(agentId: string, task: TaskPayload): Promise<TaskResult>

// Get quest log
petana.getQuests(agentId: string, limit?: number): Promise<Quest[]>

// Get leaderboard
petana.getLeaderboard(): Promise<Agent[]>

// Subscribe to real-time updates
petana.onUpdate(callback: (event: WsEvent) => void): () => void
```

## License

MIT © PETANA
