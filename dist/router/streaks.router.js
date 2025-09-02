"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const getTodayStreaks_controller_1 = require("../controller/progress/getTodayStreaks.controller");
const getStreaks_controller_1 = require("../controller/progress/getStreaks.controller");
const newStreaks_controller_1 = require("../controller/progress/newStreaks.controller");
const unLockSongs_controller_1 = require("../controller/progress/unLockSongs.controller");
const StreaksRouter = express_1.default.Router();
//TUHAIN UDRIIN STREAKS
StreaksRouter.get("/getTodayStreaksById/:userId", getTodayStreaks_controller_1.getTodayStreaks);
//TUHAIN USER DAHI NIIT STREAKS points
StreaksRouter.get("/getStreaks/:userId", getStreaks_controller_1.getStreaksByUserId);
//tsaanaa post huseltiig duudaj baigaa shuu ene 
StreaksRouter.get("/processDiary/:userId", newStreaks_controller_1.TodayProgresses);
//unLock songs
StreaksRouter.post("/UnlockSongs/:userId", unLockSongs_controller_1.UnlockSongs);
exports.default = StreaksRouter;
