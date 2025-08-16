import express from "express";
import { PostDiary } from "../controller/Diary/Post-Diary.controller";

const AiRouter = express.Router();

AiRouter.post("/postDiary", PostDiary);


export default AiRouter;
