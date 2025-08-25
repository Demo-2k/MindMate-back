import { Request, Response } from "express";
import { prisma } from "../../utils/prisma";

export const deleteDiary = async (req: Request, res: Response) => {
  const { diaryId } = req.params;

  console.log("text", diaryId);

  try {
    const existingDiary = await prisma.diaryNote.findUnique({
      where: { id: Number(diaryId) },
    });

    if (!existingDiary)
      return res.status(404).json({ error: "Diary not found" });

    const deletedDiary = await prisma.diaryNote.delete({
      where: { id: Number(diaryId) },
    });

    console.log("updss", deletedDiary);

    res.status(200).json(deletedDiary);
  } catch (error) {
    return res.status(500).json({ error: "error" });
  }
};
