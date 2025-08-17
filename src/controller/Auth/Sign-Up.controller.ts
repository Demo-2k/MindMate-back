import { Response, Request } from "express";
import bcrypt from "bcrypt";
import { prisma } from "../../utils/prisma";

export const createUser = async (req: Request, res: Response) => {
  const { email, password, username } = req.body;

  const hashedPassword = await bcrypt.hash(password, 10);
  console.log(req.body);

  try {
    const existingUser = await prisma.user.findUnique({
      where: {
        email,
      },
    });

    if (existingUser) {
      res.status(400).json({ message: "User profile already created" });
      return;
    }

    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        username,
      },
    });

    res.status(200).json({ user });
  } catch (error) {
    res.status(500).json({ message: error });
  }
};
