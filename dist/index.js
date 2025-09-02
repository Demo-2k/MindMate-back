"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const Ai_router_1 = __importDefault(require("./router/Ai.router"));
const auth_router_1 = __importDefault(require("./router/auth.router"));
const chat_controller_1 = require("./controller/chat/chat.controller");
const streaks_router_1 = __importDefault(require("./router/streaks.router"));
const user_router_1 = __importDefault(require("./router/user.router"));
const app = (0, express_1.default)();
const PORT = process.env.PORT || 4001;
app.use((0, cors_1.default)());
app.use(express_1.default.json()); // 🔑 req.body-д JSON авах
app.post("/api/chat", chat_controller_1.ChatBot);
app.use("/ai", Ai_router_1.default);
app.use("/auth", auth_router_1.default);
app.use("/progress", streaks_router_1.default);
app.use("/User", user_router_1.default);
app.listen(PORT, () => console.log(`API running on port ${PORT}`));
