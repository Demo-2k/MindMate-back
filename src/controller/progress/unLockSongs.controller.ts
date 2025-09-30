// import { Response, Request } from "express";
// import { prisma } from "../../utils/prisma";

// export const UnlockSongs = async (req: Request, res: Response) => {
//   const { userId } = req.params;
//   const { songPrice } = req.body;
//   try {
//     const user = await prisma.progress.findUnique({
//       where: { userId: Number(userId) },
//     });
    

//     if (!user) return res.status(404).json({ message: "User олдсонгүй" });

//     const currentPoints = user.points ?? 0;
//     const newPoints = Math.max(currentPoints - songPrice, 0);

//     const updateUserPoints = await prisma.progress.update({
//       where: { userId: Number(userId) },
//       data: { points: newPoints },
//     });
  
//     res.status(200).json(updateUserPoints);
//   } catch (error) {
//     res.status(500).json({ error });
//   }
// };

import { Response, Request } from "express";
import { prisma } from "../../utils/prisma";

export const UnlockSongs = async (req: Request, res: Response) => {
  const { userId } = req.params;
  const { songPrice } = req.body;

  try {
    const progress = await prisma.progress.findUnique({
      where: { userId: Number(userId) },
    });

    if (!progress) return res.status(404).json({ message: "User олдсонгүй" });

    if ((progress.points ?? 0) < songPrice) {
      return res.status(400).json({ message: "Оноо хүрэхгүй байна" });
    }

    // 1️⃣ progress онооос хасах
    const updatedProgress = await prisma.progress.update({
      where: { userId: Number(userId) },
      data: { points: { decrement: songPrice } },
    });

    // 2️⃣ user.totalPoints-г шинэчлэх
    const updatedUser = await prisma.user.update({
      where: { id: Number(userId) },
      data: { totalPoints: updatedProgress.points },
    });

    return res.status(200).json(updatedUser);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Internal server error" });
  }
};
