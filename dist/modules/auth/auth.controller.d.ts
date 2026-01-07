import { AuthService } from "./auth.service.js";
import { SendOtpDto } from "./dto/send-otp.dto.js";
import { VerifyOtpDto } from "./dto/verify-otp.dto.js";
export declare class AuthController {
    private readonly authService;
    constructor(authService: AuthService);
    sendOtp(payload: SendOtpDto): {
        message: string;
    };
    verifyOtp(payload: VerifyOtpDto): Promise<{
        message: string;
        userId: string;
    }>;
}
