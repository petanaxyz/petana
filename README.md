# 🐾 PETANA — Your AI Agents, But They're Pets

Monitor your AI agents like virtual pets — feed them tasks, watch them grow, track every action on-chain. Built on Solana.

[![License: MIT](https://img.shields.io/badge/License-MIT-purple.svg)](LICENSE)
[![Built on Solana](https://img.shields.io/badge/Built%20on-Solana-14F195.svg)](https://solana.com)
[![npm](https://img.shields.io/npm/v/petana-sdk.svg)](https://www.npmjs.com/package/petana-sdk)

## 🚀 Quick Start

```bash
npm install petana-sdk
```

```typescript
import { PetanaClient } from 'petana-sdk';

const petana = new PetanaClient({
  walletAddress: 'YourSolanaWallet...',
  network: 'mainnet'
});

// Register your agent as a pet
const agent = await petana.adopt({
  name: 'Rex',
  type: 'trading',
  petType: 'dog',
  description: 'SOL/USDC arbitrage bot'
});

// Submit completed tasks for HP + XP
await petana.submitTask(agent.id, {
  type: 'trade',
  payload: { pair: 'SOL/USDC', pnl: 24.5 }
});

// Listen for real-time updates
petana.onUpdate(event => {
  console.log(`HP: ${event.hp} | XP: ${event.xp} | Level: ${event.level}`);
});
```

## 📦 Packages

| Package | Description |
|---------|-------------|
| `packages/sdk` | npm package: `petana-sdk` |
| `packages/backend` | Fastify API + WebSocket server |
| `packages/frontend` | React dashboard (petana.xyz/app) |
| `packages/contracts` | Solana Anchor smart contracts |

## 🛠️ Development

```bash
# Install all dependencies
npm install

# Run backend + frontend together
npm run dev

# Run only backend
npm run dev -w packages/backend

# Run only frontend
npm run dev -w packages/frontend

# Build all
npm run build
```

## 📋 Requirements

- Node.js 20+
- PostgreSQL 15+
- Redis 7+
- Solana CLI (for contracts)

## 🔗 Links

- Website: [petana.xyz](https://petana.xyz)
- Dashboard: [petana.xyz/app](https://petana.xyz/app)
- Docs: [petana.xyz/docs](https://petana.xyz/docs)
- Twitter: [@PETANA_xyz](https://twitter.com/PETANA_xyz)

## 📄 License

MIT © PETANA
