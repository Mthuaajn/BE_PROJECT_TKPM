"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.EntityError = exports.ErrorWithStatus = void 0;
const httpStatus_1 = __importDefault(require("../constants/httpStatus"));
const messages_1 = __importDefault(require("../constants/messages"));
class ErrorWithStatus {
    status;
    message;
    constructor({ message, status }) {
        this.status = status;
        this.message = message;
    }
}
exports.ErrorWithStatus = ErrorWithStatus;
class EntityError extends ErrorWithStatus {
    errors;
    constructor({ message = messages_1.default.VALIDATION_ERROR, errors }) {
        super({ message, status: httpStatus_1.default.UNPROCESSABLE_ENTITY });
        this.errors = errors;
    }
}
exports.EntityError = EntityError;
