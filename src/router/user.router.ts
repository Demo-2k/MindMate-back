import express from "express";
import { updateTheme } from "../controller/Auth/theme.controller";



const UserRouter = express.Router();

UserRouter.patch("/:id/theme", updateTheme);

export default UserRouter;
