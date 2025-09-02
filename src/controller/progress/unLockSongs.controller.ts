import { Response, Request } from "express";
import { prisma } from "../../utils/prisma";

export const UnlockSongs = async (req: Request, res: Response) => {
  const { userId } = req.params;
  const { songPrice } = req.body;
  try {
    const user = await prisma.user.findUnique({
      where: { id: Number(userId) },
    });

    if (!user) return res.status(404).json({ message: "User олдсонгүй" });

    const currentPoints = user.totalPoints ?? 0;
    const newPoints = Math.max(currentPoints - songPrice, 0);

    const updateUserPoints = await prisma.user.update({
      where: { id: Number(userId) },
      data: { totalPoints: newPoints },
    });

    res.status(200).json(updateUserPoints);
  } catch (error) {
    res.status(500).json({ error });
  }
};
