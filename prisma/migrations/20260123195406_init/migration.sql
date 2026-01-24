-- CreateTable
CREATE TABLE "Log" (
    "id" TEXT NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "category" TEXT NOT NULL,
    "rawText" TEXT NOT NULL,
    "payload" JSONB NOT NULL,

    CONSTRAINT "Log_pkey" PRIMARY KEY ("id","timestamp")
);

-- CreateIndex
CREATE INDEX "Log_timestamp_idx" ON "Log"("timestamp" DESC);

CREATE EXTENSION IF NOT EXISTS timescaledb CASCADE;
SELECT create_hypertable('"Log"', 'timestamp')