/*
  Warnings:

  - You are about to drop the column `insight` on the `AiAnalysis` table. All the data in the column will be lost.
  - You are about to drop the column `mood_score` on the `AiAnalysis` table. All the data in the column will be lost.
  - You are about to drop the column `positive` on the `AiAnalysis` table. All the data in the column will be lost.

*/
-- CreateEnum
CREATE TYPE "public"."Sentiment" AS ENUM ('positive', 'negative', 'neutral');

-- AlterTable
ALTER TABLE "public"."AiAnalysis" DROP COLUMN "insight",
DROP COLUMN "mood_score",
DROP COLUMN "positive",
ADD COLUMN     "evidence" TEXT[],
ADD COLUMN     "intensity" DOUBLE PRECISION,
ADD COLUMN     "needs" TEXT[],
ADD COLUMN     "sentiment" "public"."Sentiment",
ADD COLUMN     "topics" TEXT[],
ALTER COLUMN "summary" DROP NOT NULL;
