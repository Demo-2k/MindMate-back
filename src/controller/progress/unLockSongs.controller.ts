import { Response, Request } from "express";
import { prisma } from "../../utils/prisma";

export const UnlockSongs = async (req: Request, res: Response) => {
  const { userId } = req.params;
  const { songPrice } = req.body;
  try {
    const user = await prisma.progress.findUnique({
      where: { userId: Number(userId) },
    });
    console.log("user", user);
    

    if (!user) return res.status(404).json({ message: "User олдсонгүй" });

    const currentPoints = user.points ?? 0;
    const newPoints = Math.max(currentPoints - songPrice, 0);

    console.log(newPoints, "============================");

    const updateUserPoints = await prisma.progress.update({
      where: { userId: Number(userId) },
      data: { points: newPoints },
    });

    console.log("updateUserPoints", updateUserPoints);
    

    res.status(200).json(updateUserPoints);
  } catch (error) {
    res.status(500).json({ error });
  }
};
