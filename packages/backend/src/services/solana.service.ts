import {
  Connection,
  Keypair,
  Transaction,
  TransactionInstruction,
  PublicKey,
  sendAndConfirmTransaction,
} from '@solana/web3.js';
import dotenv from 'dotenv';
dotenv.config();

const MEMO_PROGRAM_ID = new PublicKey('MemoSq4gqABAXKb96qnH8TysNcWxMyWCqXgDLGmfcHr');

let connection: Connection;
let payer: Keypair;

export function getSolanaConnection(): Connection {
  if (!connection) {
    connection = new Connection(
      process.env.SOLANA_RPC_URL || 'https://api.mainnet-beta.solana.com',
      'confirmed'
    );
  }
  return connection;
}

export function getServerKeypair(): Keypair {
  if (!payer) {
    const raw = process.env.SERVER_WALLET_PRIVATE_KEY;
    if (!raw) throw new Error('SERVER_WALLET_PRIVATE_KEY not set');
    const arr = JSON.parse(raw) as number[];
    payer = Keypair.fromSecretKey(Uint8Array.from(arr));
  }
  return payer;
}

export interface QuestLogData {
  agentId: string;
  agentName: string;
  type: string;
  payload: Record<string, unknown>;
  xpGained: number;
  hpChange: number;
}

export async function logQuestOnChain(data: QuestLogData): Promise<string> {
  const conn = getSolanaConnection();
  const signer = getServerKeypair();

  const memo = JSON.stringify({
    app: 'petana',
    v: '1.0',
    agent: data.agentId,
    name: data.agentName,
    type: data.type,
    xp: data.xpGained,
    hp: data.hpChange,
    ts: Date.now(),
    ...data.payload,
  });

  const ix = new TransactionInstruction({
    keys: [{ pubkey: signer.publicKey, isSigner: true, isWritable: false }],
    programId: MEMO_PROGRAM_ID,
    data: Buffer.from(memo, 'utf8'),
  });

  const tx = new Transaction().add(ix);
  const sig = await sendAndConfirmTransaction(conn, tx, [signer]);
  return sig;
}
