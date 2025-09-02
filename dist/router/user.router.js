"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const theme_controller_1 = require("../controller/Auth/theme.controller");
const UserRouter = express_1.default.Router();
UserRouter.patch("/:id/theme", theme_controller_1.updateTheme);
exports.default = UserRouter;
