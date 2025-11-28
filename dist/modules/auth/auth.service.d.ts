import { Model } from "mongoose";
import { UserDocument } from "./schemas/user.schema";
import { VendorDocument } from "./schemas/vendor.schema";
export declare class AuthService {
    private readonly userModel;
    private readonly vendorModel;
    private readonly demoOtp;
    private readonly mobilePattern;
    constructor(userModel: Model<UserDocument>, vendorModel: Model<VendorDocument>);
    sendOtp(mobileNo: string): {
        message: string;
    };
    verifyOtp(mobileNo: string, otp: string): Promise<{
        message: string;
        userId: string;
    }>;
    private createUserWithVendor;
    private upsertVendorRecord;
    private generateUniqueUserId;
}
