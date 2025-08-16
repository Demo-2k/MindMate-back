import { GoogleGenerativeAI } from "@google/generative-ai";
import { Response, Request } from "express";
import "dotenv/config";

export const PostDiary = async (req: Request, res: Response) => {
  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

  const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
  try {
    const { text, targetLang = "mn" } = req.body || {};
    console.log("target:", targetLang, text);

    if (!text || typeof text !== "string") {
      return res.status(400).json({ error: "text талбар шаардлагатай" });
    }

    const prompt = [
      `Чи бол өсвөр насны хүүхдийн хувийн AI зөвлөгч. Хэрэглэгч өдөр тутмын mood logging хийж байна: emoji болон богино тэмдэглэл бичсэн.`,
      `Хэрэглэгчийн өгсөн тэмдэглэл дээр үндэслэн зөвхөн JSON бүтэцтэйгээр дараахыг гаргаж өг:`,
      `1. "summary": Өдрийн тэмдэглэлийн гол санааг 2-3 өгүүлбэрээр товчхон бич. Хүүхэд өөрөө бичсэн мэт, дотнын найздаа ярьж байгаа мэт энгийн хэллэгтэй бай.`,
      `2. "emotion": Өдрийн сэтгэл хөдлөлийг тодорхойл. Боломжит ангилал: Баяртай, Стресстэй, Санаа зовсон, Бухимдсан, Тайвшралтай, Урамтай, Айсан, Уйтгарласан, Гайхсан.`,
      `3. "teen_vibe": Emotion-ийг өсвөр насныханд ойлгомжтой, энгийн casual хэллэгээр Монгол хэл дээр бич.`,
      `4. "horoscope": Өдрийн сэтгэл санаанд тулгуурласан хувийн зурхай маягийн зөвлөгөө. Өсвөр насны vibe-тэй, 2-3 өгүүлбэрээр, яг л “Өнөөдөр чиний одны байрлал зөв алхам хийхэд тусална, найзтайгаа хамт байх нь азтай өдөр болно” мэт ойлгомжтой, урам зоригтой хэллэгтэй бай.`,
      `5. "motivational_message": Богино магтаал, тайвшруулах үг. 1-2 өгүүлбэр.`,
      `Гаргалтыг зөвхөн Монгол хэл дээр JSON форматтай хариулт болгон буцаа. Markdown code block ашиглахгүй.`,
      `Жишээ:`,
      `{"summary":"Өнөөдөр багийн төсөл дээр стресстэй байсан ч хэд хэдэн жижиг алхам хийж бага зэрэг тайвширсан.","emotion":"Стресстэй","teen_vibe":"Ёоо, анхны багаараа юм хийх гэхээр үнэхээр дарамттай юм. Яаж эхлэхээ мэдэхгүй, толгой хагарах нь ээ.","horoscope":"Багаар ажиллахад одоо жаахан хэцүү байж магадгүй, гэхдээ чи оролдож байгаа учраас үр дүн гарах болно. Амьсгаа ав, багийнхантайгаа илэн далангүй ярилц, асуудлыг жижиг хэсгүүдэд хувааж шийдвэрлэ.","motivational_message":"Сайн хийсэн байна! Бага зэрэг амар, дараа нь дахин оролд. Чи чадна шүү!"}`,
    ].join("\n");

    const result = await model.generateContent([
      { text: prompt },

      { text: `Тэмдэглэл:\n${text}` },
    ]);

    const output = result.response.text(); // "```json...```" gej butsaagaad baiga bolohor json parse hiij bolohgui baina

    let cleanOutput = output.trim();

    if (cleanOutput.startsWith("```json")) {
      cleanOutput = cleanOutput
        .replace(/^```json\s*/, "")
        .replace(/\s*```$/, "");
    }

    // console.log("parsed summarize:", parsed);
    let parsed;
    parsed = JSON.parse(cleanOutput);

    res.json(parsed);
  } catch (err: any) {
    console.error("summarize error:", err);
    res.status(500).json({ error: "Summarize амжилтгүй" });
  }
};
