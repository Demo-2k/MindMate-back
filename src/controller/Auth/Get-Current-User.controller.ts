import { Response } from "express";
import { prisma } from "../../utils/prisma";
import { GetUserAuthInfoRequest } from "../../middleware/jwt-verify";

export const getCurrentUser = async (
  req: GetUserAuthInfoRequest,
  res: Response
) => {
  try {
    console.log("req: user", req.user);

    const headerUser = req.user;

    if (!headerUser) {
      res.status(400).json({ message: "Error" });
      return;
    }

    const user = await prisma.user.findUnique({
      where: { id: headerUser?.userId },
      select: {
        id: true,
        email: true,
        username: true,
        themeUrl: true,
        avatar: true,
        totalPoints: true,
        totalStreaks: true,
      },
    });

    if (!user) {
      res.status(400).json({ message: "No user info in request" });
    }

    res.status(200).json({ user });
  } catch (error) {
    res.status(500).json({ error: "error get current user" });
  }
};
