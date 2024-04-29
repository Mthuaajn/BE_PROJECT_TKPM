"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const enums_1 = require("./../constants/enums");
const User_schema_1 = __importDefault(require("../models/schemas/User.schema"));
const db_services_1 = __importDefault(require("./db.services"));
const jwt_1 = require("../utils/jwt");
const crypto_1 = require("../utils/crypto");
class UserService {
    signAccessToken(user_id) {
        return (0, jwt_1.signToken)({
            payload: { user_id, tokenType: enums_1.tokenType.accessToken },
            options: { expiresIn: process.env.JWT_ACCESS_TOKEN_EXPIRES_IN }
        });
    }
    signRefreshToken(user_id) {
        return (0, jwt_1.signToken)({
            payload: { user_id, tokenType: enums_1.tokenType.refreshToken },
            options: { expiresIn: process.env.JWT_REFRESH_TOKEN_EXPIRES_IN }
        });
    }
    async createTokens(user_id) {
        const [accessToken, refreshToken] = await Promise.all([
            this.signAccessToken(user_id),
            this.signRefreshToken(user_id)
        ]);
        return [accessToken, refreshToken];
    }
    async register(payload) {
        const result = await db_services_1.default.users.insertOne(new User_schema_1.default({
            ...payload,
            date_of_birth: new Date(payload.date_of_birth),
            password: (0, crypto_1.hashPassword)(payload.password)
        }));
        const user_id = result.insertedId.toString();
        const [accessToken, refreshToken] = await this.createTokens(user_id);
        return {
            data: {
                result,
                accessToken,
                refreshToken
            }
        };
    }
    async checkEmailExist(email) {
        const result = await db_services_1.default.users.findOne({ email });
        return Boolean(result);
    }
    async login(user_id) {
        const [accessToken, refreshToken] = await this.createTokens(user_id);
        return {
            accessToken,
            refreshToken
        };
    }
}
const userService = new UserService();
exports.default = userService;
