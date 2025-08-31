import express from "express";
import { PostDiary } from "../controller/Diary/Post-Diary.controller";
import { GetAiAnalyze } from "../controller/ai/getDiariesAiAnalyziesByUser.controller";
import { getDiaryById } from "../controller/Diary/getDiaryAi.controller";
import { getAllDiaryNotes } from "../controller/Diary/getDiaryNote.controller";

import { updateDiaryById } from "../controller/Diary/updateDiary.controller";
import { deleteDiary } from "../controller/Diary/delete.controller";
import { TodayDiary } from "../controller/Diary/getTodayDiary.controller";
import { authenticateToken } from "../middleware/jwt-verify";

const AiRouter = express.Router();

AiRouter.post("/postDiary/:userId", PostDiary);
AiRouter.delete("/deleteDiary/:diaryId", deleteDiary);

// AiRouter.post("/aiAnalyzeCreate/:diaryId", CreateAnalyzeDiary);

AiRouter.get("/getAiAnalyze/:userId", GetAiAnalyze);
AiRouter.get("/getDiaryById/:diaryId", getDiaryById);
AiRouter.get("/getAllDiaryNotes/:userId", getAllDiaryNotes);

AiRouter.get("/getTodayDiary/:userId", TodayDiary);

export default AiRouter;
