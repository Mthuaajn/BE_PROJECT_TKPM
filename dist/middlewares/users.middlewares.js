"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.registerValidator = exports.loginValidator = void 0;
const db_services_1 = __importDefault(require("../services/db.services"));
const messages_1 = __importDefault(require("../constants/messages"));
const express_validator_1 = require("express-validator");
const users_services_1 = __importDefault(require("../services/users.services"));
const Error_1 = require("../utils/Error");
const validation_1 = require("../utils/validation");
exports.loginValidator = (0, validation_1.validate)((0, express_validator_1.checkSchema)({
    email: {
        notEmpty: {
            errorMessage: messages_1.default.EMAIL_REQUIRED
        },
        isEmail: {
            errorMessage: messages_1.default.EMAIL_NOT_VALID
        },
        trim: true,
        custom: {
            options: async (value, { req }) => {
                const result = await db_services_1.default.users.findOne({ email: value });
                if (!result) {
                    throw new Error(messages_1.default.USER_NOT_FOUND);
                }
                req.user = result;
                return true;
            }
        }
    },
    password: {
        notEmpty: {
            errorMessage: messages_1.default.PASSWORD_REQUIRED
        },
        isString: {
            errorMessage: messages_1.default.PASSWORD_MUST_BE_STRING
        },
        isLength: {
            options: {
                min: 6,
                max: 12
            },
            errorMessage: messages_1.default.PASSWORD_LENGTH
        },
        isStrongPassword: {
            options: {
                minLength: 6,
                minLowercase: 1,
                minUppercase: 1,
                minNumbers: 1,
                minSymbols: 1
            },
            errorMessage: 'Password must be at least 6 characters, and contain at least 1 lowercase, 1 uppercase, 1 number, and 1 symbol'
        }
    }
}));
exports.registerValidator = (0, validation_1.validate)((0, express_validator_1.checkSchema)({
    name: {
        notEmpty: {
            errorMessage: messages_1.default.NAME_REQUIRED
        },
        isLength: {
            options: {
                min: 1,
                max: 100
            },
            errorMessage: messages_1.default.NAME_LENGTH
        },
        trim: true
    },
    email: {
        notEmpty: {
            errorMessage: messages_1.default.EMAIL_REQUIRED
        },
        isEmail: {
            errorMessage: messages_1.default.EMAIL_NOT_VALID
        },
        trim: true,
        custom: {
            options: async (value) => {
                const result = await users_services_1.default.checkEmailExist(value);
                if (result) {
                    throw new Error('Email is already exist');
                }
                return true;
            }
        }
    },
    password: {
        notEmpty: {
            errorMessage: messages_1.default.PASSWORD_REQUIRED
        },
        isString: {
            errorMessage: messages_1.default.PASSWORD_MUST_BE_STRING
        },
        isLength: {
            options: {
                min: 6,
                max: 12
            },
            errorMessage: messages_1.default.PASSWORD_LENGTH
        },
        isStrongPassword: {
            options: {
                minLength: 6,
                minLowercase: 1,
                minUppercase: 1,
                minNumbers: 1,
                minSymbols: 1
            },
            errorMessage: 'Password must be at least 6 characters, and contain at least 1 lowercase, 1 uppercase, 1 number, and 1 symbol'
        }
    },
    confirm_password: {
        notEmpty: {
            errorMessage: messages_1.default.CONFIRM_PASSWORD_REQUIRED
        },
        isString: {
            errorMessage: messages_1.default.PASSWORD_MUST_BE_STRING
        },
        isLength: {
            options: {
                min: 6,
                max: 12
            },
            errorMessage: messages_1.default.PASSWORD_LENGTH
        },
        isStrongPassword: {
            options: {
                minLength: 6,
                minLowercase: 1,
                minUppercase: 1,
                minNumbers: 1,
                minSymbols: 1
            },
            errorMessage: 'Password must be at least 6 characters, and contain at least 1 lowercase, 1 uppercase, 1 number, and 1 symbol'
        },
        custom: {
            // function check confirm password match password to request
            options: (value, { req }) => {
                if (value !== req.body.password) {
                    throw new Error_1.ErrorWithStatus({
                        message: 'Password confirmation does not match password',
                        status: 422
                    });
                }
                return true;
            }
        }
    },
    date_of_birth: {
        isISO8601: {
            options: {
                strict: true,
                strictSeparator: true
            }
        },
        errorMessage: messages_1.default.DAY_OF_BIRTH
    }
}));
