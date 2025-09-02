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
exports.processTodayDiary = processTodayDiary;
const prisma_1 = require("../../utils/prisma");
function processTodayDiary(userId) {
    return __awaiter(this, void 0, void 0, function* () {
        var _a;
        const today = new Date();
        const startOfToday = new Date(today.getFullYear(), today.getMonth(), today.getDate());
        // 1️⃣ Өнөөдрийн diary-г шалгах
        const todayDiary = yield prisma_1.prisma.diaryNote.findFirst({
            where: { userId, createdAt: { gte: startOfToday } },
            include: { aiInsight: true },
        });
        if (!todayDiary)
            return; // diary байхгүй бол юу ч хийхгүй
        // 2️⃣ Progress-г шалгаж, streak-г зөвхөн шинээр үүсгэх үед нэмнэ
        //   const progress = await prisma.progress.upsert({
        //     where: { userId },
        //      update: { streakCount: { increment: 1 } },  // update хийхгүй
        //     create: { userId, streakCount: 1, points: 0 },
        //   });
        const progress = yield prisma_1.prisma.progress.findUnique({ where: { userId } });
        if (!progress) {
            // Хэрэв progress байхгүй бол шинээр үүсгэнэ
            yield prisma_1.prisma.progress.create({
                data: { userId, streakCount: 1, points: 0 },
            });
        }
        else {
            // streak зөвхөн тухайн өдөр анх удаа diary бичсэн үед л нэмнэ
            const lastDiary = yield prisma_1.prisma.diaryNote.findFirst({
                where: { userId },
                orderBy: { createdAt: "desc" },
            });
            const lastDiaryDate = (lastDiary === null || lastDiary === void 0 ? void 0 : lastDiary.createdAt)
                ? new Date(lastDiary.createdAt).toDateString()
                : null;
            const todayDate = new Date().toDateString();
            if (lastDiaryDate !== todayDate) {
                yield prisma_1.prisma.progress.update({
                    where: { userId },
                    data: { streakCount: { increment: 1 } },
                });
            }
        }
        console.log("📊 Progress:", progress);
        const todayAchievements = Array.isArray((_a = todayDiary.aiInsight) === null || _a === void 0 ? void 0 : _a.achievements)
            ? todayDiary.aiInsight.achievements
            : [];
        console.log("🏆 Today Achievements:", todayAchievements);
        let newAchievementCount = 0;
        for (const ach of todayAchievements) {
            const exists = yield prisma_1.prisma.achievement.findUnique({
                where: { userId_achId: { userId, achId: ach.id } },
            });
            if (!exists) {
                yield prisma_1.prisma.achievement.create({
                    data: { userId, achId: ach.id, title: ach.title, desc: ach.desc },
                });
                newAchievementCount++;
            }
        }
        // 4️⃣ Шинэ achievements-аар points нэмэх
        if (newAchievementCount > 0) {
            const updated = yield prisma_1.prisma.progress.update({
                where: { userId },
                data: { points: { increment: newAchievementCount * 5 } },
            });
            console.log("⭐ Updated Progress:", updated);
        }
    });
}
