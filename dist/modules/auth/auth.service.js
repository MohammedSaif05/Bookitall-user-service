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
const user_type_constant_js_1 = require("./constants/user-type.constant.js");
const user_schema_js_1 = require("./schemas/user.schema.js");
const vendor_schema_js_1 = require("./schemas/vendor.schema.js");
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
    async verifyOtp(mobileNo, otp, userType) {
        if (!this.mobilePattern.test(mobileNo)) {
            throw new common_1.BadRequestException("mobileNo must be a 10 digit number");
        }
        if (!user_type_constant_js_1.USER_TYPES.includes(userType)) {
            throw new common_1.BadRequestException("userType must be vendor or customer");
        }
        if (otp !== this.demoOtp) {
            throw new common_1.BadRequestException("invalid otp");
        }
        const existingUser = await this.userModel.findOne({ mobileNo }).exec();
        if (existingUser) {
            if (existingUser.userType !== userType) {
                existingUser.userType = userType;
                await existingUser.save();
            }
            await this.syncRoleRecords(existingUser.userId, mobileNo, userType);
            return {
                message: "otp verified",
                userId: existingUser.userId,
            };
        }
        const userId = await this.createUserWithRoleRecord(mobileNo, userType);
        return {
            message: "otp verified",
            userId,
        };
    }
    async createUserWithRoleRecord(mobileNo, userType) {
        const userId = await this.generateUniqueUserId();
        const user = await this.userModel.create({
            mobileNo,
            userId,
            userType,
        });
        try {
            await this.syncRoleRecords(userId, mobileNo, userType);
        }
        catch {
            await this.userModel.deleteOne({ _id: user._id }).exec();
            throw new common_1.InternalServerErrorException("failed to create role record for user");
        }
        return user.userId;
    }
    async syncRoleRecords(userId, mobileNo, userType) {
        if (userType === "vendor") {
            await this.vendorModel.updateOne({ userId }, { userId, mobileNo }, { upsert: true });
            return;
        }
        await this.vendorModel.deleteOne({ userId }).exec();
    }
    async updateCustomerDetails(userId, customerName) {
        const user = await this.userModel.findOne({ userId }).exec();
        if (!user) {
            throw new common_1.NotFoundException(`User with userId ${userId} not found`);
        }
        if (user.userType !== "customer") {
            throw new common_1.BadRequestException("user is not a customer");
        }
        user.customerName = customerName;
        await user.save();
        return {
            message: "customer details updated",
            userId: user.userId,
            customerName: user.customerName,
        };
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
    __param(0, (0, mongoose_1.InjectModel)(user_schema_js_1.User.name)),
    __param(1, (0, mongoose_1.InjectModel)(vendor_schema_js_1.Vendor.name)),
    __metadata("design:paramtypes", [mongoose_2.Model,
        mongoose_2.Model])
], AuthService);
//# sourceMappingURL=auth.service.js.map