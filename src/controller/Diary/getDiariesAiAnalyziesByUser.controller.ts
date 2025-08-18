import { Response, Request } from "express";
import { prisma } from "../../utils/prisma";

export const GetAiAnalyze = async (req: Request, res: Response) => {
  const { userId } = req.params;
  try {
    const userAlldiaryAnalyze = await prisma.aiAnalysis.findMany({
      where: { diaryNote: { userId: Number(userId) } },
    });

    res.status(200).json(userAlldiaryAnalyze)
  } catch (error) {
    return res.status(500).json({ error: "AI get error" });
  }
};
