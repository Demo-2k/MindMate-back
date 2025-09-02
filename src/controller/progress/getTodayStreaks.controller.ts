import { Response, Request } from "express";

import { startOfDay, endOfDay } from "date-fns";
import { prisma } from "../../utils/prisma";

export const getTodayStreaks = async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;

    const todayStart = startOfDay(new Date());
    const todayEnd = endOfDay(new Date());

    const todayEntry = await prisma.progress.findUnique({
      where: {
        userId: Number(userId),
        createdAt: {
          gte: todayStart,
          lte: todayEnd,
        },
      },
    });

    if (!todayEntry) {
      return res.status(200).json(null);
    }

    res.status(200).json(todayEntry);
  } catch (error) {
    return res.status(500).json({ error: "error" });
  }
};