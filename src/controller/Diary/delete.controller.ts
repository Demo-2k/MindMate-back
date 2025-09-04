import { Request, Response } from "express";
import { prisma } from "../../utils/prisma";

export const deleteDiary = async (req: Request, res: Response) => {
  const { diaryId } = req.params;

  console.log("text", diaryId);

  try {
    const existingDiary = await prisma.diaryNote.findUnique({
      where: { id: Number(diaryId) },
    });

    console.log("existingDiary", existingDiary);

    if (!existingDiary)
      return res.status(404).json({ error: "Diary not found" });

    await prisma.aiAnalysis.deleteMany({
      where: { diaryNoteId: Number(diaryId)  },
    });

    await prisma.aiInsight.deleteMany({
      where: { diaryNoteId: Number(diaryId) },
    });

    await prisma.diaryNote.delete({
      where: { id: Number(diaryId)  },
    });


    res.status(200).send("sucess");
  } catch (error) {
    return res.status(500).json({ error });
  }
};
