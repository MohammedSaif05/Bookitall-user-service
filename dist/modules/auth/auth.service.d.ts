import { Model } from "mongoose";
import type { UserType } from "./constants/user-type.constant.js";
import { UserDocument } from "./schemas/user.schema.js";
import { VendorDocument } from "./schemas/vendor.schema.js";
export declare class AuthService {
    private readonly userModel;
    private readonly vendorModel;
    private readonly demoOtp;
    private readonly mobilePattern;
    constructor(userModel: Model<UserDocument>, vendorModel: Model<VendorDocument>);
    sendOtp(mobileNo: string): {
        message: string;
    };
    verifyOtp(mobileNo: string, otp: string, userType: UserType): Promise<{
        message: string;
        userId: string;
    }>;
    private createUserWithRoleRecord;
    private syncRoleRecords;
    updateCustomerDetails(userId: string, customerName: string): Promise<{
        message: string;
        userId: string;
        customerName: string;
    }>;
    private generateUniqueUserId;
}
