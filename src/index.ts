import "dotenv/config";
import express from "express";
import cors from "cors";

import AiRouter from "./router/Ai.router";
import AuthRouter from "./router/auth.router";
import { ChatBot } from "./controller/chat/chat.controller";
import StreaksRouter from "./router/streaks.router";
import UserRouter from "./router/user.router";

const app = express();
const PORT = process.env.PORT || 4001;

app.use(cors({
  origin: ["https://mind-mate-client.vercel.app", "http://localhost:3000"],
  methods: ["GET","POST","PUT","PATCH","DELETE","OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
}));

app.use(express.json()); // 🔑 req.body-д JSON авах

app.post("/api/chat", ChatBot);

app.use("/ai", AiRouter);
app.use("/auth", AuthRouter);
app.use("/progress", StreaksRouter);
app.use("/User", UserRouter )

app.listen(PORT, () => console.log(`API running on port ${PORT}`));
