"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const crypto_1 = require("crypto");
const mongoose_2 = require("mongoose");
const user_schema_1 = require("./schemas/user.schema");
const vendor_schema_1 = require("./schemas/vendor.schema");
let AuthService = class AuthService {
    userModel;
    vendorModel;
    demoOtp = "123456";
    mobilePattern = /^\d{10}$/;
    constructor(userModel, vendorModel) {
        this.userModel = userModel;
        this.vendorModel = vendorModel;
    }
    sendOtp(mobileNo) {
        if (!this.mobilePattern.test(mobileNo)) {
            throw new common_1.BadRequestException("mobileNo must be a 10 digit number");
        }
        return {
            message: "otp sent successfully",
        };
    }
    async verifyOtp(mobileNo, otp) {
        if (!this.mobilePattern.test(mobileNo)) {
            throw new common_1.BadRequestException("mobileNo must be a 10 digit number");
        }
        if (otp !== this.demoOtp) {
            throw new common_1.BadRequestException("invalid otp");
        }
        const existingUser = await this.userModel
            .findOne({ mobileNo })
            .lean()
            .exec();
        if (existingUser) {
            await this.upsertVendorRecord(existingUser.userId, mobileNo);
            return {
                message: "otp verified",
                userId: existingUser.userId,
            };
        }
        const userId = await this.createUserWithVendor(mobileNo);
        return {
            message: "otp verified",
            userId,
        };
    }
    async createUserWithVendor(mobileNo) {
        const userId = await this.generateUniqueUserId();
        const user = await this.userModel.create({
            mobileNo,
            userId,
        });
        try {
            await this.upsertVendorRecord(userId, mobileNo);
        }
        catch {
            await this.userModel.deleteOne({ _id: user._id }).exec();
            throw new common_1.InternalServerErrorException("failed to create vendor record for user");
        }
        return user.userId;
    }
    async upsertVendorRecord(userId, mobileNo) {
        await this.vendorModel.updateOne({ userId }, { userId, mobileNo }, { upsert: true });
    }
    async generateUniqueUserId() {
        while (true) {
            const userId = (0, crypto_1.randomBytes)(10).toString("base64url");
            const exists = await this.userModel.exists({ userId });
            if (!exists) {
                return userId;
            }
        }
    }
};
exports.AuthService = AuthService;
exports.AuthService = AuthService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(user_schema_1.User.name)),
    __param(1, (0, mongoose_1.InjectModel)(vendor_schema_1.Vendor.name)),
    __metadata("design:paramtypes", [mongoose_2.Model,
        mongoose_2.Model])
], AuthService);
//# sourceMappingURL=auth.service.js.map