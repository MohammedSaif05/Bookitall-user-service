export declare class AuthService {
    private readonly demoOtp;
    sendOtp(mobileNo: string): {
        message: string;
    };
    verifyOtp(mobileNo: string, otp: string): {
        message: string;
        userId: `${string}-${string}-${string}-${string}-${string}`;
    };
}
