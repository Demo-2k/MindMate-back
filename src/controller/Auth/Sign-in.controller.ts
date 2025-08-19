import { Response, Request } from "express";
import { prisma } from "../../utils/prisma";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import "dotenv/config";

export const SignIn = async (req: Request, res: Response) => {
  const { email, password } = req.body;

  try {
    const user = await prisma.user.findUnique({ where: { email } });

    if (!user || !user.password || !password) {
      res.status(400).json({ message: "try again" });
      return;
    }

    const isMatch = await bcrypt.compare(password, user?.password);

    if (isMatch) {
      const data = {
        userId: user?.id,
        email: user?.email,
      };
      const secret = process.env.SECRET!;

      const sixHour = Math.floor(Date.now() / 1000) * 6 * 60 * 60;

      const accesstoken = jwt.sign({ exp: sixHour, data }, secret);
      res.status(200).json({ accesstoken });
    } else {
      res.status(400).json({ message: "Email and password invalid" });
    }
  } catch (error) {
    res.status(500).send({ success: false, error });
  }
};
