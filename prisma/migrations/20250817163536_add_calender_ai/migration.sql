/*
  Warnings:

  - Added the required column `calendarDate` to the `AiAnalysis` table without a default value. This is not possible if the table is not empty.
  - Added the required column `calendarHighlight` to the `AiAnalysis` table without a default value. This is not possible if the table is not empty.
  - Added the required column `calendarType` to the `AiAnalysis` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "public"."CalendarType" AS ENUM ('GOAL', 'DONE', 'REMINDER');

-- AlterTable
ALTER TABLE "public"."AiAnalysis" ADD COLUMN     "calendarDate" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "calendarHighlight" TEXT NOT NULL,
ADD COLUMN     "calendarTasks" TEXT[],
ADD COLUMN     "calendarType" "public"."CalendarType" NOT NULL;
