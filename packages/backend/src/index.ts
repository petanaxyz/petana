import 'dotenv/config';
import { buildServer } from './server';
import { startHpDecayJob } from './jobs/hp-decay.job';

const PORT = parseInt(process.env.PORT || '3001', 10);

async function main() {
  const server = await buildServer();

  try {
    await server.listen({ port: PORT, host: '0.0.0.0' });
    console.log(`
🐾 PETANA Backend running!
   API:  http://localhost:${PORT}
   WS:   ws://localhost:${PORT}/ws/:walletAddress
   Docs: http://localhost:${PORT}/health
    `);

    // Start HP decay background job
    await startHpDecayJob();

  } catch (err) {
    server.log.error(err);
    process.exit(1);
  }
}

main();
