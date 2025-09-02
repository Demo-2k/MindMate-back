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
exports.updateTheme = void 0;
const prisma_1 = require("../../utils/prisma");
const updateTheme = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    const { themeUrl } = req.body;
    if (!themeUrl) {
        return res.status(400).json({ message: "Theme URL шаардлагатай" });
    }
    try {
        const userId = parseInt(id);
        const updatedUser = yield prisma_1.prisma.user.update({
            where: { id: userId },
            data: { themeUrl },
        });
        res.json(updatedUser);
    }
    catch (err) {
        console.error("Theme хадгалах үед алдаа:", err);
        res.status(500).json({ message: "Theme хадгалах үед алдаа гарлаа" });
    }
});
exports.updateTheme = updateTheme;
