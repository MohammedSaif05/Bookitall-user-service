import type { UserType } from "../constants/user-type.constant.js";
export declare class VerifyOtpDto {
    mobileNo: string;
    otp: string;
    userType: UserType;
}
