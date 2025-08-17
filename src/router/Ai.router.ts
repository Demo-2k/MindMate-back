import express from "express";
import { PostDiary } from "../controller/Diary/Post-Diary.controller";
import { GetAiAnalyze } from "../controller/Diary/getDiaryAiAnalyze.controller";

const AiRouter = express.Router();

AiRouter.post("/postDiary/:userId", PostDiary);
AiRouter.get("/getAiAnalyze/:userId", GetAiAnalyze)


export default AiRouter;
