"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.googleCallback = exports.googleLogin = exports.SignIn = void 0;
const prisma_1 = require("../../utils/prisma");
const bcrypt_1 = __importDefault(require("bcrypt"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const axios_1 = __importDefault(require("axios"));
require("dotenv/config");
const qs_1 = __importDefault(require("qs"));
// --- Email/Password login ---
const SignIn = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { email, password } = req.body;
    try {
        const user = yield prisma_1.prisma.user.findUnique({ where: { email } });
        if (!user || !user.password || !password) {
            return res.status(400).json({ message: "Invalid email or password" });
        }
        const isMatch = yield bcrypt_1.default.compare(password, user.password);
        if (!isMatch)
            return res.status(400).json({ message: "Invalid email or password" });
        const token = jsonwebtoken_1.default.sign({ data: { userId: user.id, email: user.email, username: user.username, avatar: user.avatar } }, process.env.SECRET || "mock_secret_key", { expiresIn: "6h" });
        res.status(200).json({ accesstoken: token, user: { email: user.email, username: user.username, avatar: user.avatar } });
    }
    catch (err) {
        res.status(500).json({ success: false, error: err });
    }
});
exports.SignIn = SignIn;
// --- Google login redirect ---
const googleLogin = (req, res) => {
    const clientId = process.env.GOOGLE_CLIENT_ID;
    if (!clientId)
        throw new Error("GOOGLE_CLIENT_ID is not defined");
    const rootUrl = "https://accounts.google.com/o/oauth2/v2/auth";
    const options = {
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
exports.googleLogin = googleLogin;
// --- Google login callback ---
const googleCallback = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    const code = req.query.code;
    try {
        //  Google-аас access_token авах
        const { data: tokenRes } = yield axios_1.default.post("https://oauth2.googleapis.com/token", qs_1.default.stringify({
            code,
            client_id: process.env.GOOGLE_CLIENT_ID,
            client_secret: process.env.GOOGLE_CLIENT_SECRET,
            redirect_uri: process.env.REDIRECT_URI || "http://localhost:4001/auth/google/callback",
            grant_type: "authorization_code",
        }), { headers: { "Content-Type": "application/x-www-form-urlencoded" } });
        //  Google user info авах
        const { data: googleUser } = yield axios_1.default.get("https://www.googleapis.com/oauth2/v2/userinfo", { headers: { Authorization: `Bearer ${tokenRes.access_token}` } });
        //  DB-д хэрэглэгч хадгалах (байхгүй бол create)
        let user = yield prisma_1.prisma.user.findUnique({ where: { email: googleUser.email } });
        if (!user) {
            user = yield prisma_1.prisma.user.create({
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
            user = yield prisma_1.prisma.user.update({
                where: { email: googleUser.email },
                data: { username: googleUser.name, avatar: googleUser.picture },
            });
        }
        //  JWT үүсгэх
        const jwtToken = jsonwebtoken_1.default.sign({ data: { userId: user.id, email: user.email, username: user.username, avatar: user.avatar } }, process.env.SECRET || "mock_secret_key", { expiresIn: "6h" });
        //  Frontend рүү redirect хийх
        res.redirect(`http://localhost:3000/sign-in?token=${jwtToken}&email=${encodeURIComponent(user.email)}&username=${encodeURIComponent((_a = user.username) !== null && _a !== void 0 ? _a : "")}&avatar=${encodeURIComponent((_b = user.avatar) !== null && _b !== void 0 ? _b : "")}`);
    }
    catch (err) {
        console.error(err);
        res.status(500).send("Google login failed");
    }
});
exports.googleCallback = googleCallback;
