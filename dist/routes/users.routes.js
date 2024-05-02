"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const users_middlewares_1 = require("./../middlewares/users.middlewares");
const express_1 = require("express");
const users_controllers_1 = require("../controllers/users.controllers");
const userRouter = (0, express_1.Router)();
userRouter.post('/login', users_controllers_1.loginController);
// tạo checkSchema để kiểm tra dữ liệu đầu vào
userRouter.post('/register', users_middlewares_1.registerValidator, users_controllers_1.registerController);
exports.default = userRouter;
