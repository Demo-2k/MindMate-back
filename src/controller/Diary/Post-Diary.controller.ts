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
      `Чи өсвөр насны хүүхдийн өдөр тутмын тэмдэглэлийг уншиж дүгнэлт хийдэг туслах.`,
      `Чиний зорилго нь тухайн өдрийг богино, ойлгомжтой, сонирхолтой байдлаар шинжилж, хүүхдэд өөрийгөө ойлгоход туслах явдал.`,
      `Чи өсвөр насны хүүхдийн өдөр тутмын тэмдэглэлийг шинжлэх AI туслах. 
Өгөгдөл: 
- mood: unknown 
- actionDone: false 
- streak: 0 
- progress: 0 
- diary note: ${diary.note}- Хэт албан ёсны, том хүний зөвлөгөө шиг бүү бич.  
- Богино, дотно, өсвөр насныханд ойлгомжтой үг ашигла.  
- Найздаа чат бичиж байгаа юм шиг энгийнээр бич.  
- Emoji-г байнга ашигла.  
- "өөрийгөө хөгжүүлэх", "сайжруулах оролдлого" гэх албан үг бүү хэрэглэ.  
`,
      `Өдрийн тэмдэглэлийг уншаад зөвхөн JSON бүтэцтэйгээр дараах мэдээллийг гарга:`,

      `1. "summary": 🧩 Өдрийн ерөнхий мэдрэмжийг 1–2 өгүүлбэрээр товч тайлбарла. Энгийн, дотно, эмоджи ашигла.`,

      `2. "trigger": 🔍 Тухайн өдрийн сэтгэл санаанд хамгийн их нөлөөлсөн гол үйл явдал, 1–2 жижиг зүйл байж болно.`,

      `3. "positive": ✨ Өдрийн эерэг тал буюу өөртөө хийсэн сайн үйлдэл, аз жаргал мэдэрсэн жижиг зүйл.`,

      `4. "suggestion": 🎯 Дараагийн өдөрт хэрэгжүүлэхэд амар, богино зөвлөгөө өг.`,

      `5. "mood_score": 📊 Өдрийн сэтгэл санааг 1–5-аас үнэлнэ (1: маш муу, 5: супер сайн)`,

      `6. "insight": 💡 Өнөөдөр юу шинэ зүйл ойлгосон, юу сонирхсон зэрэг жижиг ойлголт.`,
      `7. "emotion": Өдрийн тэмдэглэл дээр үндэслэн сэтгэл хөдлөлийг тодорхойл. Боломжит ангилал: ${EmotionCategory.join(
        ", "
      )}. Хэрэв нэгээс олон emotion илэрвэл JSON array хэлбэрээр гарга.`,

      `Гаргалтыг зөвхөн JSON форматтай буцаа. Markdown code block ашиглахгүй.`,

      `Жишээ: 
{
  "summary": "Өнөөдөр шалгалттай байсан болохоор жаахан стресстэй байлаа 😣.",
  "trigger": "📚 Шалгалтын дарамт",
  "positive": "👯 Найзтайгаа хамт бэлдсэн нь сэтгэл санааг маань дээрдүүлсэн",
  "suggestion": "🌿 Өнөө орой 10 минут алхаж амралт хий",
  "mood_score": 3,
  "insight": "Шалгалтаас өмнө тайвширч бэлдэх нь үр дүнтэй гэдгийг мэдсэн",
}`,
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

    res.send("succ");
    // const parsed = JSON.parse(cleanOutput);

    // const analysis = await prisma.aiAnalysis.create({
    //   data: {
    //     diaryNoteId: diary.id,
    //     summary: parsed.summary,
    //     emotions: Array.isArray(parsed.emotion)
    //       ? parsed.emotion
    //       : [parsed.emotion],
    //     horoscope: parsed.horoscope,
    //     message: parsed.motivational_message,
    //     calendarTasks: Array.isArray(parsed.calendarTasks)
    //       ? parsed.calendarTasks
    //       : [parsed.calendarTasks],
    //     calendarHighlight: parsed.calendarHighlight,
    //     calendarType: parsed.calendarType,
    //     calendarDate: new Date(diary.createdAt),
    //   },
    // });

    // res.json({ createDiary });
  } catch (err: any) {
    console.error("summarize error:", err);
    return res.status(500).json({ error: "AI output-г parse хийж чадсангүй" });
  }
};
