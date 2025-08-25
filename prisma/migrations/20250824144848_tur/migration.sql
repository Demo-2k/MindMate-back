-- AlterTable
ALTER TABLE "public"."AiAnalysis" ADD COLUMN     "insight" TEXT,
ADD COLUMN     "mood_score" INTEGER,
ADD COLUMN     "positive" TEXT,
ADD COLUMN     "suggestion" TEXT,
ALTER COLUMN "horoscope" DROP NOT NULL,
ALTER COLUMN "message" DROP NOT NULL,
ALTER COLUMN "calendarDate" DROP NOT NULL,
ALTER COLUMN "calendarHighlight" DROP NOT NULL,
ALTER COLUMN "calendarType" DROP NOT NULL;
