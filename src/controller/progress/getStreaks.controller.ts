import { Request, Response } from "express";
import { prisma } from "../../utils/prisma";

export const getStreaksByUserId = async (req: Request, res: Response) => {
  const { userId } = req.params;
  try {
    const achievements = await prisma.progress.findMany({
      where: userId ? { userId: Number(userId) } : undefined,
      orderBy: {
        createdAt: "desc",
      },
    });

    const summary = achievements.reduce(
      (acc, ach) => {
        acc.points += ach.points ?? 0;
        acc.streaks += ach?.streakCount ?? 0;
        return acc;
      },
      { points: 0, streaks: 0 }
    );

    res.status(200).json({ summary });
    // res.status(200).json(achievements);
  } catch (error) {
    return res.status(500).json({ error: "error" });
  }
};
