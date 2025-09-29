import express from "express";
import { getTodayStreaks } from "../controller/progress/getTodayStreaks.controller";
import { getStreaksByUserId } from "../controller/progress/getStreaks.controller";

import { UnlockSongs } from "../controller/progress/unLockSongs.controller";


const StreaksRouter = express.Router();

//TUHAIN UDRIIN STREAKS
StreaksRouter.get("/getTodayStreaksById/:userId", getTodayStreaks);

//TUHAIN USER DAHI NIIT STREAKS points
StreaksRouter.get("/getStreaks/:userId", getStreaksByUserId);


//unLock songs
StreaksRouter.post("/UnlockSongs/:userId", UnlockSongs)


export default StreaksRouter;
