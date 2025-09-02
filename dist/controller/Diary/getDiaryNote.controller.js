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
exports.getAllDiaryNotes = void 0;
const prisma_1 = require("../../utils/prisma");
const getAllDiaryNotes = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { userId } = req.params;
    try {
        const notes = yield prisma_1.prisma.diaryNote.findMany({
            where: userId ? { userId: Number(userId) } : undefined,
            include: {
                analysis: true,
                aiInsight: true
            },
            orderBy: {
                createdAt: "desc",
            },
        });
        res.status(200).json(notes);
    }
    catch (error) {
        return res.status(500).json({ error: "error" });
    }
});
exports.getAllDiaryNotes = getAllDiaryNotes;
