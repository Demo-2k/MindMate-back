"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.authenticateToken = void 0;
const jsonwebtoken_1 = require("jsonwebtoken");
require("dotenv/config");
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.split(" ")[1];
    if (token == null) {
        res.sendStatus(401);
        return;
    }
    try {
        const secret = process.env.SECRET;
        const decoded = (0, jsonwebtoken_1.verify)(token, secret);
        console.log("middel ware:", decoded);
        req.user = decoded.data;
        next();
        return;
    }
    catch (error) {
        res.status(401).json({ message: "Invalid token" });
    }
};
exports.authenticateToken = authenticateToken;
