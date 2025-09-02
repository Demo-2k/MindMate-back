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
exports.TodayDiary = void 0;
const date_fns_1 = require("date-fns");
const prisma_1 = require("../../utils/prisma");
const TodayDiary = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { userId } = req.params;
        const todayStart = (0, date_fns_1.startOfDay)(new Date());
        const todayEnd = (0, date_fns_1.endOfDay)(new Date());
        const todayEntry = yield prisma_1.prisma.diaryNote.findMany({
            where: {
                userId: Number(userId),
                createdAt: {
                    gte: todayStart,
                    lte: todayEnd,
                },
            },
        });
        if (!todayEntry) {
            return res.status(200).json(null);
        }
        res.status(200).json(todayEntry);
    }
    catch (error) {
        return res.status(500).json({ error: "error" });
    }
});
exports.TodayDiary = TodayDiary;
