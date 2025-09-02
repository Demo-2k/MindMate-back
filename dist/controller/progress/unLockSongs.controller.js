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
exports.UnlockSongs = void 0;
const prisma_1 = require("../../utils/prisma");
const UnlockSongs = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const { userId } = req.params;
    const { songPrice } = req.body;
    try {
        const user = yield prisma_1.prisma.user.findUnique({
            where: { id: Number(userId) },
        });
        if (!user)
            return res.status(404).json({ message: "User олдсонгүй" });
        const currentPoints = (_a = user.totalPoints) !== null && _a !== void 0 ? _a : 0;
        const newPoints = Math.max(currentPoints - songPrice, 0);
        const updateUserPoints = yield prisma_1.prisma.user.update({
            where: { id: Number(userId) },
            data: { totalPoints: newPoints },
        });
        res.status(200).json(updateUserPoints);
    }
    catch (error) {
        res.status(500).json({ error });
    }
});
exports.UnlockSongs = UnlockSongs;
