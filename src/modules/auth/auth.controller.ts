import { Body, Controller, Post } from "@nestjs/common";
import { AuthService } from "./auth.service.js";
import { SendOtpDto } from "./dto/send-otp.dto.js";
import { VerifyOtpDto } from "./dto/verify-otp.dto.js";

@Controller("auth")
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post("send-otp")
  sendOtp(@Body() payload: SendOtpDto) {
    return this.authService.sendOtp(payload.mobileNo);
  }

  @Post("verify-otp")
  verifyOtp(@Body() payload: VerifyOtpDto) {
    return this.authService.verifyOtp(
      payload.mobileNo,
      payload.otp,
      payload.userType,
    );
  }
}
