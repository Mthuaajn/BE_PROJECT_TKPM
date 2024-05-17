"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.tokenType = exports.UserVerifyStatus = void 0;
var UserVerifyStatus;
(function (UserVerifyStatus) {
    UserVerifyStatus[UserVerifyStatus["Unverified"] = 0] = "Unverified";
    UserVerifyStatus[UserVerifyStatus["Verified"] = 1] = "Verified";
    UserVerifyStatus[UserVerifyStatus["Banned"] = 2] = "Banned"; // bị khóa
})(UserVerifyStatus || (exports.UserVerifyStatus = UserVerifyStatus = {}));
var tokenType;
(function (tokenType) {
    tokenType[tokenType["accessToken"] = 0] = "accessToken";
    tokenType[tokenType["refreshToken"] = 1] = "refreshToken";
    tokenType[tokenType["emailVerifyToken"] = 2] = "emailVerifyToken";
    tokenType[tokenType["forgotPasswordToken"] = 3] = "forgotPasswordToken";
})(tokenType || (exports.tokenType = tokenType = {}));
