import { GoogleGenerativeAI } from "@google/generative-ai";
import { Response, Request } from "express";
import "dotenv/config";
import { prisma } from "../../utils/prisma";
import { saveAchievements } from "../progress/newAchiements.controller";

export const PostDiary = async (req: Request, res: Response) => {
  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

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

    let isDiary = await prisma.diaryNote.findFirst({
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
      isDiary = await prisma.diaryNote.update({
        where: { id: isDiary.id },
        data: { note: isDiary.note + "\n\n" + text, updatedAt: new Date() },
      });
    } else {
      // Байхгүй бол шинээр үүсгэх
      isDiary = await prisma.diaryNote.create({
        data: { userId: Number(userId), note: text },
      });
    }

    const diary = await prisma.diaryNote.findUnique({
      where: { id: Number(isDiary?.id) },
    });

    const EmotionCategory = [
      "БАЯРТАЙ", // баяр хөөртэй
      "ГУНИГТАЙ", // гансарсан
      "СТРЕССТЭЙ", // шалгалт, даалгавар, ачаалалтай үед
      "ТАЙВАН", // chill, амгалан
      "УУРТАЙ", // бухимдсан, цухалдсан
    ];
    if (!diary) return res.status(404).json({ error: "Diary олдсонгүй" });

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

    const result = await model.generateContent({
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

    function normalizeEmotion(emotion: string) {
      if (allowedEmotions.includes(emotion)) return emotion;
      // closest match олох (жишээ нь ГАЙХАЛТАЙ → БАЯРТАЙ)
      if (emotion === "ГАЙХАЛТАЙ") return "БАЯРТАЙ";
      return "ТАЙВАН"; // fallback
    }

    const parsedEmotions = Array.isArray(parsed.emotion)
      ? parsed.emotion.map(normalizeEmotion)
      : [normalizeEmotion(parsed.emotion)];

    const analysis = await prisma.aiAnalysis.upsert({
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
   "achievements" хэсэг байж магадгүй, заримдаа хоосон массив [] эсвэл байхгүй байж болно.

    {
      "mood_caption": "Гэрт асуудалтай байсан ч чи хичээлээ хийх гээд оролдож байгаа нь үнэхээр 🔥!",
      "fun_fact": "TikTok дээр 30 секундийн инээдтэй бичлэг үзэхэд ч стресс буурдаг гээд бод доо 😂📱",
      "achievements": [
        { "id": "j01", "title": "Diary Drop", "desc": "Өдрийн тэмдэглэлээ share хийлээ ✍️" },
        { "id": "s01", "title": "Mood Fighter", "desc": "Хэцүү vibe-ийг давсан 💪✨" }
      ],
    }
    `,
    ].join("\n");

    const insight = await model.generateContent({
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
      InsightCleanOutput = InsightCleanOutput.replace(
        /^```json\s*/,
        ""
      ).replace(/\s*```$/, "");
    }

    console.log("cleanoutpt", InsightCleanOutput);

    // res.send("succ");
    const parsedInsight = JSON.parse(InsightCleanOutput);
    
    const achievementsArray = Array.isArray(parsedInsight.achievements)
      ? parsedInsight.achievements
      : JSON.parse(parsedInsight.achievements || "[]");

    const aiInsightAnalyze = await prisma.aiInsight.upsert({
      where: { diaryNoteId: diary.id },
      update: {
        mood_caption: parsedInsight.mood_caption,
        fun_fact: parsedInsight.fun_fact,
        achievements: achievementsArray,
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
    if (
      aiInsightAnalyze.achievements &&
      Array.isArray(aiInsightAnalyze.achievements) &&
      aiInsightAnalyze.achievements.length > 0
    ) {
      await saveAchievements(Number(userId), aiInsightAnalyze.achievements);
    }

    res.json({ aiInsightAnalyze });
  } catch (err: any) {
    console.error("summarize error:", err);
    return res.status(500).json({ error: "AI output-г parse хийж чадсангүй" });
  }
};
