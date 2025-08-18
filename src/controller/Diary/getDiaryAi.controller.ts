import { Response, Request } from "express";
import { prisma } from "../../utils/prisma";

export const getDiaryById = async (req: Request, res: Response) => {
  const { diaryId } = req.params;
  
  try {
    const userAlldiaryAnalyze = await prisma.aiAnalysis.findUnique({
      where: { diaryNoteId:Number(diaryId)},
    });

    res.status(200).json(userAlldiaryAnalyze)
  } catch (error) {
    return res.status(500).json({ error: "AI get error" });
  }
};