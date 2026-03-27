-- CreateTable
CREATE TABLE "Agent" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "petType" TEXT NOT NULL,
    "description" TEXT,
    "ownerWallet" TEXT NOT NULL,
    "hp" DOUBLE PRECISION NOT NULL DEFAULT 100,
    "maxHp" DOUBLE PRECISION NOT NULL DEFAULT 100,
    "xp" INTEGER NOT NULL DEFAULT 0,
    "level" INTEGER NOT NULL DEFAULT 1,
    "status" TEXT NOT NULL DEFAULT 'idle',
    "evolved" BOOLEAN NOT NULL DEFAULT false,
    "lastTaskAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Agent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Quest" (
    "id" TEXT NOT NULL,
    "agentId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "payload" JSONB NOT NULL,
    "xpGained" INTEGER NOT NULL DEFAULT 0,
    "hpChange" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "txHash" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Quest_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Battle" (
    "id" TEXT NOT NULL,
    "challengerId" TEXT NOT NULL,
    "opponentId" TEXT NOT NULL,
    "winnerId" TEXT,
    "stake" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "vrfResult" TEXT,
    "txHash" TEXT,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completedAt" TIMESTAMP(3),

    CONSTRAINT "Battle_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Agent_ownerWallet_idx" ON "Agent"("ownerWallet");

-- CreateIndex
CREATE INDEX "Quest_agentId_idx" ON "Quest"("agentId");

-- AddForeignKey
ALTER TABLE "Quest" ADD CONSTRAINT "Quest_agentId_fkey" FOREIGN KEY ("agentId") REFERENCES "Agent"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Battle" ADD CONSTRAINT "Battle_challengerId_fkey" FOREIGN KEY ("challengerId") REFERENCES "Agent"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Battle" ADD CONSTRAINT "Battle_opponentId_fkey" FOREIGN KEY ("opponentId") REFERENCES "Agent"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
