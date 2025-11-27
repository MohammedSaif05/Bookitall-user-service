import { AuthService } from './auth.service';
import { SendOtpDto } from './dto/send-otp.dto';
import { VerifyOtpDto } from './dto/verify-otp.dto';
export declare class AuthController {
    private readonly authService;
    constructor(authService: AuthService);
    sendOtp(payload: SendOtpDto): {
        message: string;
    };
    verifyOtp(payload: VerifyOtpDto): {
        message: string;
        userId: `${string}-${string}-${string}-${string}-${string}`;
    };
}
