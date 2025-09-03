import { Request, Response } from "express";
import { prisma } from "../../utils/prisma";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import "dotenv/config";

// --- Email/Password login ---
export const SignIn = async (req: Request, res: Response) => {
  const { email, password } = req.body;

  try {
    const user = await prisma.user.findUnique({ where: { email } });

    if (!user || !user.password || !password) {
      return res.status(400).json({ message: "Invalid email or password" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: "Invalid email or password" });

    const token = jwt.sign(
      {
        data: {
          userId: user.id,
          email: user.email,
          username: user.username,
          avatar: user.avatar,
        },
      },
      process.env.SECRET || "mock_secret_key",
      { expiresIn: "6h" }
    );

    res.status(200).json({
      accesstoken: token,
      user: {
        email: user.email,
        username: user.username,
        avatar: user.avatar,
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: err });
  }
};

// --- SignUp (email/password) ---
export const SignUp = async (req: Request, res: Response) => {
  const { email, password, username } = req.body;

  try {

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ message: "User profile already created" });
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = await prisma.user.create({
      data: {
        email,
        username,
        password: hashedPassword,
      },
    });
    const token = jwt.sign(
      {
        data: {
          userId: newUser.id,
          email: newUser.email,
          username: newUser.username,
          avatar: newUser.avatar,
        },
      },
      process.env.SECRET || "mock_secret_key",
      { expiresIn: "6h" }
    );

    res.status(201).json({
      signUpUserAccessToken: token,
      user: {
        email: newUser.email,
        username: newUser.username,
        avatar: newUser.avatar,
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: err });
  }
};
