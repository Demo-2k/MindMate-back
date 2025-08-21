import { Response, Request } from "express";
import bcrypt from "bcrypt";
import { prisma } from "../../utils/prisma";
import jwt from "jsonwebtoken";

export const createUser = async (req: Request, res: Response) => {
  const { email, password, username } = req.body;

  const hashedPassword = await bcrypt.hash(password, 10);

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
    const data = {
      userId: user?.id,
      email: user?.email,
      username: user?.username,
    };
 
    const secret = process.env.SECRET!;
    const sixHour = Math.floor(Date.now() / 1000) * 6 * 60 * 60;
 
    const signUpUserAccessToken = jwt.sign({ exp: sixHour, data }, secret);
 
    res.status(200).json({ signUpUserAccessToken });
  } catch (error) {
    res.status(500).json({ message: error });
  }
};
