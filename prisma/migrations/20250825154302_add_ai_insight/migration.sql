-- CreateTable
CREATE TABLE "public"."AiInsight" (
    "id" SERIAL NOT NULL,
    "diaryNoteId" INTEGER NOT NULL,
    "mood_caption" TEXT,
    "fun_fact" TEXT,
    "highlight" TEXT[],
    "achievements" JSONB[],
    "tldr" TEXT,
    "moodChallenge" JSONB,

    CONSTRAINT "AiInsight_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "AiInsight_diaryNoteId_key" ON "public"."AiInsight"("diaryNoteId");

-- AddForeignKey
ALTER TABLE "public"."AiInsight" ADD CONSTRAINT "AiInsight_diaryNoteId_fkey" FOREIGN KEY ("diaryNoteId") REFERENCES "public"."DiaryNote"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
