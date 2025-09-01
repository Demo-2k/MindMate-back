import "dotenv/config";
import express from "express";
import cors from "cors";

import AiRouter from "./router/Ai.router";
import AuthRouter from "./router/auth.router";
import { ChatBot } from "./controller/chat/chat.controller";
import StreaksRouter from "./router/streaks.router";
import UserRouter from "./router/user.router";

const app = express();

app.use(cors());

app.use(express.json()); // 🔑 req.body-д JSON авах

app.post("/api/chat", ChatBot);

app.use("/ai", AiRouter);
app.use("/auth", AuthRouter);
app.use("/progress", StreaksRouter);
app.use("/User", UserRouter )


app.listen(4001, () => console.log("API running on http://localhost:4001"));
