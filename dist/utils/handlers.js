"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.wrapRequestHandler = void 0;
const wrapRequestHandler = (fn) => {
    return async function (req, res, next) {
        try {
            await fn(req, res, next);
        }
        catch (err) {
            next(err);
        }
    };
};
exports.wrapRequestHandler = wrapRequestHandler;
