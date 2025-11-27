"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const common_1 = require("@nestjs/common");
const crypto_1 = require("crypto");
let AuthService = class AuthService {
    demoOtp = '123456';
    sendOtp(mobileNo) {
        if (!/^\d{10}$/.test(mobileNo)) {
            throw new common_1.BadRequestException('mobileNo must be a 10 digit number');
        }
        return {
            message: 'otp sent successfully',
        };
    }
    verifyOtp(mobileNo, otp) {
        if (!/^\d{10}$/.test(mobileNo)) {
            throw new common_1.BadRequestException('mobileNo must be a 10 digit number');
        }
        if (otp !== this.demoOtp) {
            throw new common_1.BadRequestException('invalid otp');
        }
        return {
            message: 'otp verified',
            userId: (0, crypto_1.randomUUID)(),
        };
    }
};
exports.AuthService = AuthService;
exports.AuthService = AuthService = __decorate([
    (0, common_1.Injectable)()
], AuthService);
//# sourceMappingURL=auth.service.js.map