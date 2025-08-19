import { Request, Response } from "express";
import { prisma } from "../../utils/prisma";

export const getAllDiaryNotes = async (req: Request, res: Response) => {
    const { userId } = req.params
try {
     const notes = await prisma.diaryNote.findMany({
      where: userId ? { userId: Number(userId) } : undefined, 
      include: {
        analysis: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });
  res.status(200).json(notes)
} catch (error) {
    return res.status(500).json({ error: "error" });
}
 
}
