/*
  Warnings:

  - The `achievements` column on the `AiInsight` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterTable
ALTER TABLE "public"."AiInsight" DROP COLUMN "achievements",
ADD COLUMN     "achievements" JSONB;
