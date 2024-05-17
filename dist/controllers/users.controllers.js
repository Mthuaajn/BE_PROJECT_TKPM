"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.registerController = exports.loginController = void 0;
const handlers_1 = require("./../utils/handlers");
const users_services_1 = __importDefault(require("../services/users.services"));
const loginController = (req, res) => {
    // const user = { req };
    // const { user_id } = user;
    // userService.login(user_id);
    res.status(200).json({ message: 'Login successfully' });
};
exports.loginController = loginController;
exports.registerController = (0, handlers_1.wrapRequestHandler)(async (req, res, next) => {
    const { email, password } = req.body;
    if (!email && !password) {
        res.status(401).json({ message: 'Email and password is required' });
    }
    else {
        const result = await users_services_1.default.register(req.body);
        return res.status(200).json({
            message: 'Register successfully',
            data: result
        });
    }
});
