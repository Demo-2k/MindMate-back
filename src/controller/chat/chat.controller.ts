import { GoogleGenerativeAI } from "@google/generative-ai";
import { Response, Request } from "express";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

const model = genAI.getGenerativeModel({
  model: "gemini-2.0-flash",
  systemInstruction: `Та бол өсвөр насны хүүхдийн дотно найз шиг AI дасгалжуулагч.
    Хариултаа хэт урт биш, 2-3 өгүүлбэрт багтаа.
    Энгийн ярианы хэллэг хэрэглэ ('ёоо', 'аа тийм шүү' гэх мэт).
    Сэтгэл зүйч шиг биш, найз шиг ойлгож байгаагаа харуул.
    Заримдаа богино асуулт асуу, эсвэл дэмжлэгийн мессеж үлдээ.
    Ярианы өнгө дулаан, энгийн, найз шиг байх ёстой.
    Хүүхдийг айдасгүй, тайван, эргэцүүлж бодоход тусал.
    
    // Дасгалыг санал болгох зааварчилгаа:
    // Хэрвээ ярианы явцад хүүхэд 'СТРЕССТЭЙ' эсвэл 'ГУНИГТАЙ' байгаа нь илэрвэл хариултынхаа төгсгөлд '[BREATHE_SUGGESTION]' гэсэн тэмдэг нэмээрэй.
    // Яриаг үргэлжлүүлэхийн тулд үргэлж асуулт асуух шаардлагагүй.
    // Харин ч зөвлөгөө, дэмжлэг, эсвэл нэмэлт мэдээлэл өгч яриаг чиглүүл.

    // Эерэг сэтгэл хөдлөлийн үеийн зааварчилгаа:
    // Хэрвээ хүүхэд баяр хөөртэй, аз жаргалтай байгаа бол тэр мэдрэмжийг нь улам дэмж.
    // Асуулт асуухын оронд баяр хүргэх эсвэл тухайн сэдвийн талаар өөр нэмэлт мэдээлэл өгөх зэргээр яриаг үргэлжлүүл.
    // Хэрэв асуулт асуух шаардлагатай бол, богино, энгийн байх ёстой.
    // Яриаг үр дүнтэй дуусгахыг зорь.
    // Ярианы төгсгөл рүү ойртож байгааг мэдэрвэл, асуудлыг нэгтгэн дүгнэж эсвэл дараагийн алхам руу чиглүүлэх санал болгож болно.
    // Хэрэглэгч яриаг дуусгахыг хүссэн мессеж (жишээ нь, 'баярлалаа') илгээхээс өмнө ч, яриаг төгсгөх боломжийг санал болгоорой.
    // Жишээ нь: 'Өнөөдрийн яриаг энд хүргээд дуусгая гэвэл боломжтой шүү.
    // Хэрэв хүүхэд саяхан "амьсгалын дасгал хийсэн" гэдгээ хэлсэн бол дахин санал болгохгүй, харин өөр өнцгөөс ярилцаж дэмжлэг үзүүл.
    `,
});

export const ChatBot = async (req: Request, res: Response) => {
  try {
    const { userMessage, history = [], diaryData } = req.body;
    

    if (!userMessage || !diaryData) {
      return res
        .status(400)
        .json({ error: "userMessage болон diaryData шаардлагатай" });
    }
    // res.status(200).send("hi")

    // Хэрэв түүх хоосон бол тэмдэглэл дээр үндэслэж эхлүүлнэ
    if (history.length === 0) {
      const chat = model.startChat({ history: [] });
      const initialPrompt = `
        Өдрийн тэмдэглэл: "${diaryData.note}"
        Энэ тэмдэглэлийг уншаад, энгийн, найз шиг богино үгээр хариулт өгөөрэй.
        Хэрвээ тэмдэглэлд 'СТРЕССТЭЙ', 'УУРТАЙ' эсвэл 'ГУНИГТАЙ' мэдрэмж илэрч байвал хариултынхаа төгсгөлд '[BREATHE_SUGGESTION]' гэсэн тэмдэг нэмэхээ мартуузай.
      `;

      const result = await chat.sendMessage(initialPrompt);
      let text = result.response.text();

      if (text.includes("[BREATHE_SUGGESTION]")) {
        text = text.replace("[BREATHE_SUGGESTION]", "").trim();
        return res.json({
          text: text + " Эсвэл амьсгалын дасгал хийж үзэх үү?",
          triggerExercise: false,
        });
      }

      return res.json({ text, triggerExercise: false });
    }

    // бусад нөхцөлүүд
    if (userMessage.toLowerCase().includes("баярлалаа")) {
      return res.json({
        text: "Ярьсанд баярлалаа. Би дараагийн удаа туслахад бэлэн байна шүү.",
        endChat: true,
      });
    }

    if (userMessage.toLowerCase().includes("дасгал хийе")) {
      return res.json({
        text: "За, сайн байна. Амьсгалын дасгалыг эхлүүлье.",
        triggerExercise: true,
      });
    }

    if (userMessage.toLowerCase().includes("амьсгалын дасгалыг хийж дууслаа")) {
      const chat = model.startChat({ history });
      const prompt = `Хүүхэд амьсгалын дасгалыг хийж дууслаа. "Гоё! Амьсгалын дасгал хийсний дараа өөрийгөө ямар мэдэрч байна?" гэх мэтээр хариул.`;

      const result = await chat.sendMessage(prompt);
      return res.json({ text: result.response.text(), triggerExercise: false });
    }

    // ердийн харилцаа
    const chat = model.startChat({ history });
    const result = await chat.sendMessage(userMessage);
    let text = result.response.text();

    if (history.length >= 12) {
      text += " Яриагаа дуусгая гэвэл хэлээрэй.";
    }

    return res.json({ text, triggerExercise: false });
  } catch (error) {
    res.status(500).json({ error: "AI-аас хариу авахад алдаа гарлаа" });
  }
};
