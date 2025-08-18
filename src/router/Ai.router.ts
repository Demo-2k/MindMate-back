import express from "express";
import { PostDiary } from "../controller/Diary/Post-Diary.controller";
import { GetAiAnalyze } from "../controller/Diary/getDiariesAiAnalyziesByUser.controller";
import { getDiaryById } from "../controller/Diary/getDiaryAi.controller";

const AiRouter = express.Router();

AiRouter.post("/postDiary/:userId", PostDiary);
AiRouter.get("/getAiAnalyze/:userId", GetAiAnalyze);
AiRouter.get("/getDiaryById/:diaryId", getDiaryById)


export default AiRouter;
