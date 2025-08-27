import { Request, Response } from "express";
import { prisma } from "../../utils/prisma";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import axios from "axios";
import "dotenv/config";
import qs from "qs";

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
      { data: { userId: user.id, email: user.email, username: user.username, avatar: user.avatar } },
      process.env.SECRET || "mock_secret_key",
      { expiresIn: "6h" }
    );

    res.status(200).json({ accesstoken: token, user: { email: user.email, username: user.username, avatar: user.avatar } });
  } catch (err) {
    res.status(500).json({ success: false, error: err });
  }
};

// --- Google login redirect ---
export const googleLogin = (req: Request, res: Response) => {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  if (!clientId) throw new Error("GOOGLE_CLIENT_ID is not defined");

  const rootUrl = "https://accounts.google.com/o/oauth2/v2/auth";
  const options: Record<string, string> = {
    redirect_uri: process.env.REDIRECT_URI || "http://localhost:4001/auth/google/callback",
    client_id: clientId,
    access_type: "offline",
    response_type: "code",
    prompt: "consent",
    scope: ["openid", "email", "profile"].join(" "),
  };

  const qsParams = new URLSearchParams(options).toString();
  res.redirect(`${rootUrl}?${qsParams}`);
};

// --- Google login callback ---
export const googleCallback = async (req: Request, res: Response) => {
  const code = req.query.code as string;

  try {
    //  Google-аас access_token авах
    const { data: tokenRes } = await axios.post(
      "https://oauth2.googleapis.com/token",
      qs.stringify({
        code,
        client_id: process.env.GOOGLE_CLIENT_ID!,
        client_secret: process.env.GOOGLE_CLIENT_SECRET!,
        redirect_uri: process.env.REDIRECT_URI || "http://localhost:4001/auth/google/callback",
        grant_type: "authorization_code",
      }),
      { headers: { "Content-Type": "application/x-www-form-urlencoded" } }
    );

    //  Google user info авах
    const { data: googleUser } = await axios.get(
      "https://www.googleapis.com/oauth2/v2/userinfo",
      { headers: { Authorization: `Bearer ${tokenRes.access_token}` } }
    );

    //  DB-д хэрэглэгч хадгалах (байхгүй бол create)
    let user = await prisma.user.findUnique({ where: { email: googleUser.email } });
    if (!user) {
  user = await prisma.user.create({
    data: {
      email: googleUser.email,
      username: googleUser.name,
      avatar: googleUser.picture,
      password: Math.random().toString(36).slice(-8) 
    },
  });
}
 else {
      // Optional: Update username/avatar
      user = await prisma.user.update({
        where: { email: googleUser.email },
        data: { username: googleUser.name, avatar: googleUser.picture },
      });
    }

    //  JWT үүсгэх
    const jwtToken = jwt.sign(
      { data: { userId: user.id, email: user.email, username: user.username, avatar: user.avatar } },
      process.env.SECRET || "mock_secret_key",
      { expiresIn: "6h" }
    );

    //  Frontend рүү redirect хийх
    res.redirect(
      `http://localhost:3000/sign-in?token=${jwtToken}&email=${encodeURIComponent(user.email)}&username=${encodeURIComponent(user.username ?? "")}&avatar=${encodeURIComponent(user.avatar ?? "")}`
    );
  } catch (err) {
    console.error(err);
    res.status(500).send("Google login failed");
  }
};
