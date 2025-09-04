import { Request, Response } from "express";
import { prisma } from "../../utils/prisma";

export const getStreaksByUserId = async (req: Request, res: Response) => {
  const { userId } = req.params;

  try {
    const achievements = await prisma.progress.findMany({
      where: { userId: Number(userId) },
      orderBy: {
        createdAt: "desc",
      },
    });

    const summary = achievements.reduce(
      (
        acc: { points: any; streaks: any },
        ach: { points: any; streakCount: any }
      ) => {
        acc.points += ach.points ?? 0;
        acc.streaks += ach?.streakCount ?? 0;
        return acc;
      },
      { points: 0, streaks: 0 }
    );

    res.status(200).json({ summary });
  } catch (error) {
    return res.status(500).json({ error: "error" });
  }
};
