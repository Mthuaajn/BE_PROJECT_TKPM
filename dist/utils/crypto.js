"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.hashPassword = void 0;
const crypto_1 = require("crypto");
function sha256(content) {
    return (0, crypto_1.createHash)('sha256').update(content).digest('hex');
}
function hashPassword(password) {
    return sha256(password + process.env.PASSWORD_SECRET);
}
exports.hashPassword = hashPassword;
