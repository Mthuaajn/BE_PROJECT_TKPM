"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.defaultErrorHandlers = void 0;
const lodash_1 = require("lodash");
const httpStatus_1 = __importDefault(require("../constants/httpStatus"));
const defaultErrorHandlers = (err, req, res, next) => {
    //  omit để loại bỏ status trong object err
    res.status(err.status || httpStatus_1.default.INTERNAL_SERVER_ERROR).json((0, lodash_1.omit)(err, 'status'));
};
exports.defaultErrorHandlers = defaultErrorHandlers;
