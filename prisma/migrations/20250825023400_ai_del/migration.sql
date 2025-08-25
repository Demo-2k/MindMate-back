/*
  Warnings:

  - You are about to drop the column `calendarDate` on the `AiAnalysis` table. All the data in the column will be lost.
  - You are about to drop the column `calendarHighlight` on the `AiAnalysis` table. All the data in the column will be lost.
  - You are about to drop the column `calendarTasks` on the `AiAnalysis` table. All the data in the column will be lost.
  - You are about to drop the column `calendarType` on the `AiAnalysis` table. All the data in the column will be lost.
  - You are about to drop the column `horoscope` on the `AiAnalysis` table. All the data in the column will be lost.
  - You are about to drop the column `message` on the `AiAnalysis` table. All the data in the column will be lost.
  - You are about to drop the column `suggestion` on the `AiAnalysis` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "public"."AiAnalysis" DROP COLUMN "calendarDate",
DROP COLUMN "calendarHighlight",
DROP COLUMN "calendarTasks",
DROP COLUMN "calendarType",
DROP COLUMN "horoscope",
DROP COLUMN "message",
DROP COLUMN "suggestion";
