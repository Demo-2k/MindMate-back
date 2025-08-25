import { GoogleGenerativeAI } from "@google/generative-ai";
import { Response, Request } from "express";
import "dotenv/config";
import { prisma } from "../../utils/prisma";

export const PostDiary = async (req: Request, res: Response) => {
  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

  const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

  try {
    const { text, targetLang = "mn" } = req.body || {};
    const { userId } = req.params;

    if (!text || typeof text !== "string") {
      return res.status(400).json({ error: "text талбар шаардлагатай" });
    }

    const createDiary = await prisma.diaryNote.create({
      data: {
        userId: Number(userId),
        note: text,
      },
    });

    console.log("createDiary", createDiary);

    const diary = await prisma.diaryNote.findUnique({
      where: { id: Number(createDiary?.id) },
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
  "emotion": "Өдрийн тэмдэглэл дээр үндэслэн сэтгэл хөдлөлийг тодорхойл. Боломжит ангилал: БАЯРТАЙ, ГУНИГТАЙ, СТРЕССТЭЙ, ТАЙВАН, УУРТАЙ. Хэрэв нэгээс олон emotion илэрвэл JSON array хэлбэрээр гарга.",
  "sentiment": "Өдрийн нийт сэтгэл хөдлөлийг тодорхойл. Боломжит утгууд: positive, neutral, negative.",
  "intensity": "0..1 хооронд утга өг, сэтгэл хөдлөлийн хүчийг илэрхийлнэ.",
  "topics": ["Diary дээр дурдагдсан гол сэдвүүд. Боломжит ангилал: study, work, health, family, social, self-growth."],
  "needs": ["Хэрэглэгчийн хүсэл шаардлага, зөвлөгөө шаардсан зүйлс. Боломжит ангилал: encouragement, plan, rest, celebrate, focus."],
  "evidence": ["Diary текстээс авсан тод жишээ. Хамгийн тодорхой 2-5 snippet."],
  "moodText": {
    "emoji": "Тухайн emotion-т тохирох эможи",
    "text": "Энгийн, хөөрхөн хэллэгтэй нэг өгүүлбэрийн урамшуулал. Жишээ: '😊 Өнөөдөр чи их баяртай байна!'"
  },
  "moodAction": "Өнөөдрийн сэтгэл хөдлөлд тохирсон жижиг алхам эсвэл зөвлөгөө. Жишээ: 'Найздаа баяртайгаа хуваалцаарай 👯', '10 минут алхаж тархиа сэргээгээрэй 🚶‍♀️', 'Амьсгалын дасгал хийгээд завсарлаарай 🌿'."
}

Гаргалтыг зөвхөн JSON хэлбэрээр буцаа. Markdown code block хэрэглэхгүй.

Жишээ гаргалт:
{
  "summary":"Өнөөдөр даалгавраа дуусгаж чадаагүйгээс болж урам хугарсан, бага зэрэг ядарсан байдалтай байна.",
  "emotion":["ГУНИГТАЙ","СТРЕССТЭЙ"],
  "sentiment":"negative",
  "intensity":0.75,
  "topics":["study","self-growth"],
  "needs":["encouragement","rest","plan"],
  "evidence":["дуусгаж чадалгүй","урам хугарлаа","ядаж байна"],
  "moodText": {
    "emoji": "😢",
    "text": "Өнөөдөр жаахан гунигтай өнгөрсөн ч чи даваад гарч чадна!"
  },
  "moodAction": "Өөртөө дуртай зүйл хийж баярлуул ☕️"
}
`,
    ].join("\n");

    // чиний одоогийн prompt-оо хэрэглэнэ

    const result = await model.generateContent([
      { text: prompt },
      { text: `Тэмдэглэл:\n${diary.note}` },
    ]);

    let cleanOutput = result.response.text().trim();
    if (cleanOutput.startsWith("```json")) {
      cleanOutput = cleanOutput
        .replace(/^```json\s*/, "")
        .replace(/\s*```$/, "");
    }

    console.log("cleanoutpt", cleanOutput);

    // res.send("succ");
    const parsed = JSON.parse(cleanOutput);

    const analysis = await prisma.aiAnalysis.create({
      data: {
        diaryNoteId: diary.id,
        summary: parsed.summary,
        emotions: Array.isArray(parsed.emotion)
          ? parsed.emotion
          : [parsed.emotion],
          sentiment:parsed.sentiment,

          intensity:parsed.intensity,

          topics:Array.isArray(parsed.topics)
          ? parsed.topics
          : [parsed.topics],

          needs:Array.isArray(parsed.needs)
          ? parsed.needs
          : [parsed.needs],
          evidence:Array.isArray(parsed.evidence)
          ? parsed.evidence
          : [parsed.evidence],

          moodText: parsed.moodText,
          moodAction: parsed.moodAction
        // horoscope: parsed.horoscope,
        // message: parsed.motivational_message,
        // calendarTasks: Array.isArray(parsed.calendarTasks)
        //   ? parsed.calendarTasks
        //   : [parsed.calendarTasks],
        // calendarHighlight: parsed.calendarHighlight,
        // calendarType: parsed.calendarType,
        // calendarDate: new Date(diary.createdAt),
      },
    });

    res.json({ analysis });
  } catch (err: any) {
    console.error("summarize error:", err);
    return res.status(500).json({ error: "AI output-г parse хийж чадсангүй" });
  }
};
