"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const Sign_Up_controller_1 = require("../controller/Auth/Sign-Up.controller");
const jwt_verify_1 = require("../middleware/jwt-verify");
const Get_Current_User_controller_1 = require("../controller/Auth/Get-Current-User.controller");
const Sign_in_controller_1 = require("../controller/Auth/Sign-in.controller");
const AuthRouter = express_1.default.Router();
AuthRouter.post("/sign-up", Sign_Up_controller_1.createUser);
AuthRouter.post("/sign-in", Sign_in_controller_1.SignIn);
AuthRouter.get("/get-current-user", jwt_verify_1.authenticateToken, Get_Current_User_controller_1.getCurrentUser);
// AuthRouter.post("/mock-google", mockGoogleLogin);
AuthRouter.get("/google", Sign_in_controller_1.googleLogin);
AuthRouter.get("/google/callback", Sign_in_controller_1.googleCallback);
exports.default = AuthRouter;
