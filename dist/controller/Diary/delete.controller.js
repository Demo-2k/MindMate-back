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
exports.deleteDiary = void 0;
const prisma_1 = require("../../utils/prisma");
const deleteDiary = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { diaryId } = req.params;
    console.log("text", diaryId);
    try {
        const existingDiary = yield prisma_1.prisma.diaryNote.findUnique({
            where: { id: Number(diaryId) },
        });
        if (!existingDiary)
            return res.status(404).json({ error: "Diary not found" });
        const deletedDiary = yield prisma_1.prisma.diaryNote.delete({
            where: { id: Number(diaryId) },
        });
        console.log("updss", deletedDiary);
        res.status(200).json(deletedDiary);
    }
    catch (error) {
        return res.status(500).json({ error: "error" });
    }
});
exports.deleteDiary = deleteDiary;
