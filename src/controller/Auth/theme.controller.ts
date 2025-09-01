import { Request, Response } from "express";
import { prisma } from "../../utils/prisma";

export const updateTheme = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { themeUrl } = req.body;

  if (!themeUrl) {
    return res.status(400).json({ message: "Theme URL шаардлагатай" });
  }

  try {
    const userId = parseInt(id);

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { themeUrl },
    });

    res.json(updatedUser);
  } catch (err) {
    console.error("Theme хадгалах үед алдаа:", err);
    res.status(500).json({ message: "Theme хадгалах үед алдаа гарлаа" });
  }
};
