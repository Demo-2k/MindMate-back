import express from "express";
import { PostDiary } from "../controller/Diary/Post-Diary.controller";
import { GetAiAnalyze } from "../controller/Diary/getDiariesAiAnalyziesByUser.controller";
import { getDiaryById } from "../controller/Diary/getDiaryAi.controller";
import { getAllDiaryNotes } from "../controller/Diary/getDiaryNote.controller";

const AiRouter = express.Router();

AiRouter.post("/postDiary/:userId", PostDiary);
AiRouter.get("/getAiAnalyze/:userId", GetAiAnalyze);
AiRouter.get("/getDiaryById/:diaryId", getDiaryById)
AiRouter.get("/getAllDiaryNotes/:userId", getAllDiaryNotes)


export default AiRouter;
