import "dotenv/config";
import express from "express";
import cors from "cors";

import { GoogleGenerativeAI } from "@google/generative-ai";
import userRouter from "./router/turshilt";

const app = express();

app.use(cors());

app.use("/auth", userRouter);

app.use(express.json()); // 🔑 req.body-д JSON авах

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

// Хурдан, хямд: "gemini-1.5-flash"; илүү чанартай: "gemini-1.5-pro"

const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

app.post("/api/summarize", async (req, res) => {
  try {
    const { text, targetLang = "mn" } = req.body || {};
    console.log("target:", targetLang, text);

    if (!text || typeof text !== "string") {
      return res.status(400).json({ error: "text талбар шаардлагатай" });
    }

    const prompt = [
      `Чи бол өсвөр насны хүүхдийн хувийн AI зөвлөгч.`,
      `Тэмдэглэлийн үндсэн дээр гурван хэсэг хариулт өг:`,
      `1. Summary: товчилсон гол агуулга`,
      `2. Emotion: тухайн өдрийн сэтгэл хөдлөлийг (баяртай, гунигтай, стрессдсэн гэх мэт) тодорхойл`,
      `3.Emotion:(өсвөр насны хүүхдийн илэрхийлсэн сэтгэл хөдлөлийг дараах байдлаар илэрхийлж илгээ)Тодорхойлсон сэтгэл хөдлөлүүдийг Inside out хүүхэлдэйн киногоор илэрхийл! баяр хөөр:Joy, гуниг:Sadness, уур:Anger, айдас:Fear, зэвүүцэл:Disgust, түгшүүр:Anxiety, атаархал:Envy, уйтгар:Ennui, ичимхий:Embarresment`,
      `4. Horoscope: тухайн өдрийн сэтгэл санаанд тулгуурласан хувийн "сэтгэл зурхай"`,
      `Гаргалтыг ${targetLang} хэл дээр JSON бүтэцтэй өг.`,
      `JSON format: {"summary": "...", "emotion": "...", "horoscope": "..."}`,
    ].join("\n");

    const result = await model.generateContent([
      { text: prompt },

      { text: `Тэмдэглэл:\n${text}` },
    ]);
    

    const output = result.response.text();

    res.json({ summary: output });

  } catch (err: any) {
    console.error("summarize error:", err);
    res.status(500).json({ error: "Summarize амжилтгүй" });
  }
});

app.listen(4001, () => console.log("API running on http://localhost:4001"));
