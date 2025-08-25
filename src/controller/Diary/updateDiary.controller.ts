import { Request, Response } from "express";
import { prisma } from "../../utils/prisma";

export const updateDiaryById = async (req: Request, res: Response) => {
  const { diaryId } = req.params;
  const { text } = req.body;
  console.log("text", diaryId);

  try {
    const existingDiary = await prisma.diaryNote.findUnique({
      where: { id: Number(diaryId) },
    });

    if (!existingDiary)
      return res.status(404).json({ error: "Diary not found" });

    const updatedText = existingDiary.note + " " + text;

    const updatedDiary = await prisma.diaryNote.update({
      where: { id: Number(diaryId) },
      data: {
        note: updatedText,
      },
    });

    console.log("updss", updatedDiary);

    res.status(200).json(updatedDiary);
  } catch (error) {
    return res.status(500).json({ error: "error" });
  }
};
