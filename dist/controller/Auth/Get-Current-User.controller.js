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
exports.getCurrentUser = void 0;
const prisma_1 = require("../../utils/prisma");
const getCurrentUser = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        console.log("req: user", req.user);
        const headerUser = req.user;
        if (!headerUser) {
            res.status(400).json({ message: "Error" });
            return;
        }
        const user = yield prisma_1.prisma.user.findUnique({
            where: { id: headerUser === null || headerUser === void 0 ? void 0 : headerUser.userId },
            select: {
                id: true,
                email: true,
                username: true,
                themeUrl: true,
                avatar: true,
                totalPoints: true,
                totalStreaks: true,
            },
        });
        if (!user) {
            res.status(400).json({ message: "No user info in request" });
        }
        res.status(200).json({ user });
    }
    catch (error) {
        res.status(500).json({ error: "error get current user" });
    }
});
exports.getCurrentUser = getCurrentUser;
