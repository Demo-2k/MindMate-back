import "dotenv/config";
import express from "express";
import cors from "cors";

import AiRouter from "./router/Ai.router";
import AuthRouter from "./router/auth.router";

const app = express();

app.use(cors());

app.use(express.json()); // 🔑 req.body-д JSON авах

app.use("/ai", AiRouter);
app.use("/auth", AuthRouter)

// app.post("/api/summarize", async (req, res) => {
//   //   const models = await genAI.listModels();
//   // console.log(models);
  
// });

app.listen(4001, () => console.log("API running on http://localhost:4001"));
