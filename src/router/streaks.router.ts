import express from "express";
import { getTodayStreaks } from "../controller/progress/getTodayStreaks.controller";
import { getStreaksByUserId } from "../controller/progress/getStreaks.controller";

const StreaksRouter = express.Router();

StreaksRouter.get("/getStreaksById/:userId", getTodayStreaks);

StreaksRouter.get("/getStreaks/:userId", getStreaksByUserId);


export default StreaksRouter;
