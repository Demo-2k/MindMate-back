import { JwtPayload, verify } from "jsonwebtoken";
import { NextFunction, Request, Response } from "express";
import "dotenv/config";

type DecodedUser = {
  userId: number;
  email: string;
  username: string;
};

export type GetUserAuthInfoRequest = Request & {
  user?: DecodedUser;
};

export const authenticateToken = (
  req: GetUserAuthInfoRequest,
  res: Response,
  next: NextFunction
) => {
  const authHeader = req.headers["authorization"] as string;
  const token = authHeader && authHeader.split(" ")[1];

  if (token == null) {
    res.sendStatus(401);
    return;
  }

  try {
    const secret = process.env.SECRET!;
    const decoded = verify(token, secret) as JwtPayload;

    console.log("middel ware:", decoded);
    

    req.user = decoded.data as DecodedUser;
    next();
    return;
  } catch (error) {
    res.status(401).json({ message: "Invalid token" });
  }
};