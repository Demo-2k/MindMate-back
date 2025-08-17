import express from "express";
import { createUser } from "../controller/Auth/Sign-Up.controller";

const AuthRouter = express.Router();

AuthRouter.post("/sign-up", createUser);


export default AuthRouter;