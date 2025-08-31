/*
  Warnings:

  - A unique constraint covering the columns `[userId,achId]` on the table `Achievement` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "public"."Achievement_userId_key";

-- CreateIndex
CREATE UNIQUE INDEX "Achievement_userId_achId_key" ON "public"."Achievement"("userId", "achId");
