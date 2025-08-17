/*
  Warnings:

  - The `emotions` column on the `AiAnalysis` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- CreateEnum
CREATE TYPE "public"."EmotionCategory" AS ENUM ('БАЯРТАЙ', 'ГУНИГТАЙ', 'СТРЕССТЭЙ', 'УРАМ_ЗОРИГТОЙ', 'ХӨӨРСӨН', 'ТАЙВАН', 'САНАА_ЗОВСОН', 'УУРТАЙ', 'ГАНЦААРДСАН', 'ЭНЕРГИ_ДҮҮРЭН', 'СОНИРХОЛГҮЙ', 'ИЧСЭН');

-- AlterTable
ALTER TABLE "public"."AiAnalysis" DROP COLUMN "emotions",
ADD COLUMN     "emotions" "public"."EmotionCategory"[];
