import { Model } from "mongoose";
import type { UserType } from "./constants/user-type.constant.js";
import { CustomerDocument } from "./schemas/customer.schema.js";
import { UserDocument } from "./schemas/user.schema.js";
import { VendorDocument } from "./schemas/vendor.schema.js";
export declare class AuthService {
    private readonly userModel;
    private readonly customerModel;
    private readonly vendorModel;
    private readonly demoOtp;
    private readonly mobilePattern;
    constructor(userModel: Model<UserDocument>, customerModel: Model<CustomerDocument>, vendorModel: Model<VendorDocument>);
    sendOtp(mobileNo: string): {
        message: string;
    };
    verifyOtp(mobileNo: string, otp: string, userType: UserType): Promise<{
        message: string;
        userId: string;
    }>;
    private createUserWithRoleRecord;
    private syncRoleRecords;
    private generateUniqueUserId;
}
