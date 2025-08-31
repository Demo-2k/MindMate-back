/*
  Warnings:

  - You are about to drop the column `evidence` on the `AiAnalysis` table. All the data in the column will be lost.
  - You are about to drop the column `intensity` on the `AiAnalysis` table. All the data in the column will be lost.
  - You are about to drop the column `moodText` on the `AiAnalysis` table. All the data in the column will be lost.
  - You are about to drop the column `sentiment` on the `AiAnalysis` table. All the data in the column will be lost.
  - You are about to drop the column `highlight` on the `AiInsight` table. All the data in the column will be lost.
  - You are about to drop the column `moodChallenge` on the `AiInsight` table. All the data in the column will be lost.
  - You are about to drop the column `tldr` on the `AiInsight` table. All the data in the column will be lost.
  - You are about to drop the column `avatar` on the `User` table. All the data in the column will be lost.
  - Made the column `password` on table `User` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "public"."AiAnalysis" DROP COLUMN "evidence",
DROP COLUMN "intensity",
DROP COLUMN "moodText",
DROP COLUMN "sentiment";

-- AlterTable
ALTER TABLE "public"."AiInsight" DROP COLUMN "highlight",
DROP COLUMN "moodChallenge",
DROP COLUMN "tldr";

-- AlterTable
ALTER TABLE "public"."User" DROP COLUMN "avatar",
ALTER COLUMN "password" SET NOT NULL;
