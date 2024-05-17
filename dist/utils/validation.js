"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.validate = void 0;
const express_validator_1 = require("express-validator");
const Error_1 = require("./Error");
const httpStatus_1 = __importDefault(require("../constants/httpStatus"));
// can be reused by many routes
// sequential processing, stops running validations chain if the previous one fails.
const validate = (validation) => {
    return async (req, res, next) => {
        await validation.run(req);
        // nếu mà không có lỗi thì next
        const errors = (0, express_validator_1.validationResult)(req);
        if (errors.isEmpty()) {
            return next();
        }
        const errorsObj = errors.mapped();
        const entityError = new Error_1.EntityError({ errors: {} });
        for (const key in errorsObj) {
            const { msg } = errorsObj[key];
            if (msg instanceof Error_1.ErrorWithStatus && msg.status !== httpStatus_1.default.UNPROCESSABLE_ENTITY) {
                return next(msg);
            }
            entityError.errors[key] = errorsObj[key];
        }
        return next(entityError);
    };
};
exports.validate = validate;
