import express from "express";
import { createUser } from "../controller/Auth/Sign-Up.controller";
import { authenticateToken } from "../middleware/jwt-verify";
import { getCurrentUser } from "../controller/Auth/Get-Current-User.controller";
import {  googleCallback, googleLogin, SignIn } from "../controller/Auth/Sign-in.controller";

const AuthRouter = express.Router();

AuthRouter.post("/sign-up", createUser);
AuthRouter.post("/sign-in", SignIn);
AuthRouter.get("/get-current-user", authenticateToken, getCurrentUser);
// AuthRouter.post("/mock-google", mockGoogleLogin);
AuthRouter.get("/google", googleLogin);
AuthRouter.get("/google/callback", googleCallback);



export default AuthRouter;