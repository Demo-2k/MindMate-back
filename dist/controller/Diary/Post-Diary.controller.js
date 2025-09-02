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
exports.PostDiary = void 0;
const generative_ai_1 = require("@google/generative-ai");
require("dotenv/config");
const prisma_1 = require("../../utils/prisma");
const PostDiary = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const genAI = new generative_ai_1.GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
    try {
        const { text } = req.body || {};
        const { userId } = req.params;
        const startOfDay = new Date();
        startOfDay.setHours(0, 0, 0, 0);
        const endOfDay = new Date();
        endOfDay.setHours(23, 59, 59, 999);
        if (!text || typeof text !== "string") {
            return res.status(400).json({ error: "text талбар шаардлагатай" });
        }
        let isDiary = yield prisma_1.prisma.diaryNote.findFirst({
            where: {
                userId: Number(userId),
                createdAt: {
                    gte: startOfDay,
                    lte: endOfDay,
                },
            },
        });
        if (isDiary) {
            // Өдрийн тэмдэглэл байгаа бол update хийх
            isDiary = yield prisma_1.prisma.diaryNote.update({
                where: { id: isDiary.id },
                data: { note: isDiary.note + "\n\n" + text, updatedAt: new Date() },
            });
        }
        else {
            // Байхгүй бол шинээр үүсгэх
            isDiary = yield prisma_1.prisma.diaryNote.create({
                data: { userId: Number(userId), note: text },
            });
        }
        const diary = yield prisma_1.prisma.diaryNote.findUnique({
            where: { id: Number(isDiary === null || isDiary === void 0 ? void 0 : isDiary.id) },
        });
        if (!diary)
            return res.status(404).json({ error: "Diary олдсонгүй" });
        const prompt = [
            `Чи бол өсвөр насны хүүхдийн хувийн AI зөвлөгч. Хэрэглэгч өдөр тутмын diary бичсэн.

    Хэрэглэгчийн тэмдэглэл дээр үндэслэн **зөвхөн JSON форматтай** анализыг гаргаж өг. JSON-ийн бүтэц дараах байдалтай бай:
    {
      "summary": "Өдрийн тэмдэглэлийн гол санааг 2-3 өгүүлбэрээр товчхон бич. Хүүхэд өөрөө бичсэн мэт, энгийн хэллэгтэй бай.",
      "emotion": "Өдрийн тэмдэглэл дээр үндэслэн сэтгэл хөдлөлийг тодорхойл. 
Зөвхөн дараах ангиллуудаас сонго: БАЯРТАЙ, ГУНИГТАЙ, СТРЕССТЭЙ, ТАЙВАН, УУРТАЙ. 
Өөр ангилал гаргахыг хатуу хоригло.",
      "moodAction": "Өнөөдрийн сэтгэл хөдлөлд тохирсон **богино, шууд зөвлөгөө** бич. Жишээ: '10 минут алхаж тархиа сэргээгээрэй 🚶‍♀️', 'Амьсгалын дасгал хийгээд завсарлаарай 🌿'"
    }
    Гаргалтыг зөвхөн JSON хэлбэрээр буцаа. Markdown code block хэрэглэхгүй.

    Жишээ гаргалт:
    {
      "summary":"Өнөөдөр даалгавраа дуусгаж чадаагүйгээс болж урам хугарсан, бага зэрэг ядарсан байдалтай байна.",
      "emotion":["ГУНИГТАЙ","СТРЕССТЭЙ"],
      "moodAction": "Өөртөө дуртай зүйл хийж баярлуул ☕️"
    }
    `,
        ].join("\n");
        const result = yield model.generateContent({
            contents: [
                { role: "user", parts: [{ text: prompt }] },
                { role: "user", parts: [{ text: `Тэмдэглэл:\n${diary.note}` }] },
            ],
            generationConfig: {
                temperature: 0.7,
                topK: 40,
                topP: 0.85,
            },
        });
        let cleanOutput = result.response.text().trim();
        if (cleanOutput.startsWith("```json")) {
            cleanOutput = cleanOutput
                .replace(/^```json\s*/, "")
                .replace(/\s*```$/, "");
        }
        console.log("cleanoutpt", cleanOutput);
        const parsed = JSON.parse(cleanOutput);
        const allowedEmotions = [
            "БАЯРТАЙ",
            "ГУНИГТАЙ",
            "СТРЕССТЭЙ",
            "ТАЙВАН",
            "УУРТАЙ",
        ];
        function normalizeEmotion(emotion) {
            if (allowedEmotions.includes(emotion))
                return emotion;
            // closest match олох (жишээ нь ГАЙХАЛТАЙ → БАЯРТАЙ)
            if (emotion === "ГАЙХАЛТАЙ")
                return "БАЯРТАЙ";
            return "ТАЙВАН"; // fallback
        }
        const parsedEmotions = Array.isArray(parsed.emotion)
            ? parsed.emotion.map(normalizeEmotion)
            : [normalizeEmotion(parsed.emotion)];
        const analysis = yield prisma_1.prisma.aiAnalysis.upsert({
            where: { diaryNoteId: diary.id },
            update: {
                summary: parsed.summary,
                emotions: parsedEmotions,
                moodAction: parsed.moodAction,
            },
            create: {
                diaryNoteId: diary.id,
                summary: parsed.summary,
                emotions: parsedEmotions,
                moodAction: parsed.moodAction,
            },
        });
        //insight heseg
        const Insightprompt = [
            `Чи бол өсвөр насны хүүхдийн хувийн AI зөвлөгч, дотно найз шиг нь хариулдаг.
Хэрэглэгчийн өдрийн тэмдэглэл дээр үндэслэн зөвхөн JSON буцаа. Markdown хэрэглэхгүй.

JSON формат:
{
  "mood_caption": "Товч урам зориг өгөх текст",
  "fun_fact": "Өөрт сонирхолтой, хөгжилтэй fact",
  "achievements": [
    {
      "id": "unique_id",
      "title": "Achievement title",
      "desc": "Achievement-ийн тайлбар"
    }
  ]
}

Шаардлага:
- "achievements" хэсэг нь 1 эсвэл 2 item л агуулна.
- Өдрийн хамгийн гол, сонирхолтой үйлдэл, бодол, тэмдэглэл дээр тулгуурлан achievement үүсгэ.
- Хоосон массив ([]) үүсгэх хэрэггүй.
- Хэрэглэгчийн тэмдэглэлээс олон item гаргахаас зайлсхий.`,
        ].join("\n");
        const insight = yield model.generateContent({
            contents: [
                { role: "user", parts: [{ text: Insightprompt }] },
                { role: "user", parts: [{ text: `Тэмдэглэл:\n${diary.note}` }] },
            ],
            generationConfig: {
                temperature: 0.95,
                topK: 60,
                topP: 0.95,
            },
        });
        let InsightCleanOutput = insight.response.text().trim();
        if (InsightCleanOutput.startsWith("```json")) {
            InsightCleanOutput = InsightCleanOutput.replace(/^```json\s*/, "").replace(/\s*```$/, "");
        }
        console.log("cleanoutpt", InsightCleanOutput);
        // res.send("succ");
        const parsedInsight = JSON.parse(InsightCleanOutput);
        const achievementsArray = Array.isArray(parsedInsight.achievements)
            ? parsedInsight.achievements
            : JSON.parse(parsedInsight.achievements || "[]");
        const aiInsightAnalyze = yield prisma_1.prisma.aiInsight.upsert({
            where: { diaryNoteId: diary.id },
            update: {
                mood_caption: parsedInsight.mood_caption,
                fun_fact: parsedInsight.fun_fact,
                // achievements: achievementsArray,
            },
            create: {
                diaryNoteId: diary.id,
                mood_caption: parsedInsight.mood_caption,
                fun_fact: parsedInsight.fun_fact,
                achievements: achievementsArray,
            },
        });
        // if (
        //   aiInsightAnalyze.achievements &&
        //   aiInsightAnalyze.achievements.length > 0
        // ) {
        //   await saveAchievements(Number(userId), aiInsightAnalyze.achievements);
        // }
        // if (
        //   aiInsightAnalyze.achievements &&
        //   Array.isArray(aiInsightAnalyze.achievements) &&
        //   aiInsightAnalyze.achievements.length > 0
        // ) {
        //   await saveAchievements(Number(userId), aiInsightAnalyze.achievements);
        // }
        res.json({ aiInsightAnalyze });
    }
    catch (err) {
        console.error("summarize error:", err);
        return res.status(500).json({ error: "AI output-г parse хийж чадсангүй" });
    }
});
exports.PostDiary = PostDiary;
