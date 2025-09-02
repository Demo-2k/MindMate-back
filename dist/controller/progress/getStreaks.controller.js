"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getStreaksByUserId = void 0;
const prisma_1 = require("../../utils/prisma");
const getStreaksByUserId = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { userId } = req.params;
    console.log("user id streaks all:", userId);
    try {
        const achievements = yield prisma_1.prisma.progress.findMany({
            where: { userId: Number(userId) },
            orderBy: {
                createdAt: "desc",
            },
        });
        const summary = achievements.reduce((acc, ach) => {
            var _a, _b;
            acc.points += (_a = ach.points) !== null && _a !== void 0 ? _a : 0;
            acc.streaks += (_b = ach === null || ach === void 0 ? void 0 : ach.streakCount) !== null && _b !== void 0 ? _b : 0;
            return acc;
        }, { points: 0, streaks: 0 });
        const updatedTotalStreack = yield prisma_1.prisma.user.update({
            where: { id: Number(userId) },
            data: { totalPoints: summary.points, totalStreaks: summary.streaks },
        });
        console.log("updatedTotalStreack", updatedTotalStreack);
        res.status(200).json({ summary });
        // res.status(200).json(achievements);
    }
    catch (error) {
        return res.status(500).json({ error: "error" });
    }
});
exports.getStreaksByUserId = getStreaksByUserId;
