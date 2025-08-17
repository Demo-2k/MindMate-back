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

    const EmotionCategory = [
      "БАЯРТАЙ", // баяр хөөртэй
      "ГУНИГТАЙ", // гансарсан
      "СТРЕССТЭЙ", // шалгалт, даалгавар, ачаалалтай үед
      "УРАМ_ЗОРИГТОЙ", // "charge авсан"
      "ХӨӨРСӨН", // догдолсон, сэтгэл хөдөлсөн
      "ТАЙВАН", // chill, амгалан
      "САНАА_ЗОВСОН", // түгшсэн, айдастай
      "УУРТАЙ", // бухимдсан, цухалдсан
      "ГАНЦААРДСАН", // ойлгогдохгүй байгаа, ганцаардсан
      "ЭНЕРГИ_ДҮҮРЭН", // hyper, хэт их эрч хүчтэй
      "СОНИРХОЛГҮЙ", // уйдсан, motivation буусан
      "ИЧСЭН",
    ];

    const prompt = [
      `Чи бол өсвөр насны хүүхдийн хувийн AI зөвлөгч. Хэрэглэгч өдөр тутмын diary бичиж байна.`,
      `Хэрэглэгчийн өгсөн тэмдэглэл дээр үндэслэн зөвхөн JSON бүтэцтэйгээр дараахыг гаргаж өг:`,
      ``,
      `1. "summary": Өдрийн тэмдэглэлийн гол санааг 2-3 өгүүлбэрээр товчхон бич. Хүүхэд өөрөө бичсэн мэт, дотнын найздаа ярьж байгаа мэт энгийн хэллэгтэй бай.`,
      `2. "emotion": Өдрийн тэмдэглэл дээр үндэслэн сэтгэл хөдлөлийг тодорхойл. Боломжит ангилал: ${EmotionCategory.join(
        ", "
      )}. Хэрэв нэгээс олон emotion илэрвэл JSON array хэлбэрээр гарга.`,
      `3. "horoscope": Өдрийн сэтгэл санаанд тулгуурласан хувийн зурхай маягийн зөвлөгөө. Өсвөр насны vibe-тэй, 2-3 өгүүлбэрээр, ойлгомжтой, урам зоригтой хэллэгтэй бай.`,
      `4. "motivational_message": Богино магтаал, тайвшруулах үг. 1-2 өгүүлбэр.`,
      `5. "calendarTasks": Хэрэглэгчийн diary дээр үндэслэн тухайн өдөр хийсэн чухал үйлдлүүдийг жагсааж бич. Жишээ нь: ["Хичээлд суулаа","Дасгал хийсэн","Ном уншсан"].`,
      `6. "calendarHighlight": Тухайн өдрийг товч илэрхийлэх нэг өгүүлбэр. Diary-г бүхэлд нь calendar дээр тавихгүй, харин snapshot маягаар товчхон бич.`,
      `7. "calendarType": Diary дээр хэрэв "ирээдүйд хийхээр шийдсэн, зорьж буй үйлдэл" байвал "GOAL" гэж буцаа. 
   Хэрэв зөвхөн өнгөрсөнд хийсэн зүйл л дурдагдсан бол "DONE". 
   Хэрэв diary зөвхөн сануулга маягтай бол "REMINDER".
   Хэрэв diary-д зэрэгцээд "хийсэн" болон "хийх" зүйл хоёулаа байвал "GOAL"-ийг давуу эрхтэйгээр сонго.`,
      `Гаргалтыг зөвхөн JSON форматтай буцаа. Markdown code block ашиглахгүй.`,
      `Жишээ: {"summary":"Өнөөдөр шалгалтанд бэлдэх гэж жаахан стрессдсэн ч ном уншаад дээрдсэн.","emotion":["СТРЕССТЭЙ","ТАЙВАН"],"horoscope":"Стресс чамд саад болж байгаа ч урагшлах тэмүүлэлтэй байна. Бага зэрэг амрахад гэмгүй.","motivational_message":"Чи сайн байна! Бага багаар ахиж байгаа нь маш том алхам.","calendarTasks":["Шалгалтанд бэлдсэн","Ном уншсан"],"calendarHighlight":"Ном уншаад тайвширсан өдөр", "calendarType":"DONE"}`,
    ].join("\n");

    const result = await model.generateContent([
      { text: prompt },

      { text: `Тэмдэглэл:\n${text}` },
    ]);

    const output = result.response.text(); // "```json...```" gej butsaagaad baiga bolohor json parse hiij bolohgui baina
    //  res.json(output);
    let cleanOutput = output.trim();

    if (cleanOutput.startsWith("```json")) {
      cleanOutput = cleanOutput
        .replace(/^```json\s*/, "")
        .replace(/\s*```$/, "");
    }

    // console.log("parsed summarize:", parsed);
    let parsed;
    parsed = JSON.parse(cleanOutput);
    console.log("parsed:", parsed);

    // res.json(parsed);
    const createAiAnalysis = await prisma.aiAnalysis.create({
      data: {
        diaryNoteId: createDiary.id,
        summary: parsed.summary,
        emotions: Array.isArray(parsed.emotion)
          ? parsed.emotion
          : [parsed.emotion],
        horoscope: parsed.horoscope,
        message: parsed.motivational_message,
        calendarTasks: Array.isArray(parsed.calendarTasks)
          ? parsed.calendarTasks
          : [parsed.calendarTasks],
        calendarHighlight: parsed.calendarHighlight,
        calendarType: parsed.calendarType,
        calendarDate: new Date(createDiary.createdAt)
      },
    });

    res.json(createAiAnalysis);
  } catch (err: any) {
    console.error("summarize error:", err);
    return res.status(500).json({ error: "AI output-г parse хийж чадсангүй" });
  }
};
