import express from "express";
import { getTodayStreaks } from "../controller/progress/getTodayStreaks.controller";
import { getStreaksByUserId } from "../controller/progress/getStreaks.controller";
import { TodayProgresses } from "../controller/progress/newStreaks.controller";
import { UnlockSongs } from "../controller/progress/unLockSongs.controller";


const StreaksRouter = express.Router();

//TUHAIN UDRIIN STREAKS
StreaksRouter.get("/getTodayStreaksById/:userId", getTodayStreaks);

//TUHAIN USER DAHI NIIT STREAKS points
StreaksRouter.get("/getStreaks/:userId", getStreaksByUserId);


//tsaanaa post huseltiig duudaj baigaa shuu ene 
StreaksRouter.get("/processDiary/:userId", TodayProgresses);

//unLock songs
StreaksRouter.post("/UnlockSongs/:userId", UnlockSongs)


export default StreaksRouter;
