import express from "express";
import { getWords } from "../controller/turshilt.controller";


const userRouter = express.Router();

userRouter.post("/turshilt", getWords);

export default userRouter