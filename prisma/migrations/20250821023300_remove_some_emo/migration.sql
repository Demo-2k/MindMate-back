/*
  Warnings:

  - The values [САНАА_ЗОВСОН,ГАНЦААРДСАН] on the enum `EmotionCategory` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "public"."EmotionCategory_new" AS ENUM ('БАЯРТАЙ', 'ГУНИГТАЙ', 'СТРЕССТЭЙ', 'ТАЙВАН', 'УУРТАЙ');
ALTER TABLE "public"."AiAnalysis" ALTER COLUMN "emotions" TYPE "public"."EmotionCategory_new"[] USING ("emotions"::text::"public"."EmotionCategory_new"[]);
ALTER TYPE "public"."EmotionCategory" RENAME TO "EmotionCategory_old";
ALTER TYPE "public"."EmotionCategory_new" RENAME TO "EmotionCategory";
DROP TYPE "public"."EmotionCategory_old";
COMMIT;
