import { IsEnum, IsString, Matches } from "class-validator";
import { USER_TYPES } from "../constants/user-type.constant.js";
import type { UserType } from "../constants/user-type.constant.js";

export class VerifyOtpDto {
  @IsString()
  @Matches(/^\d{10}$/, {
    message: "mobileNo must be a 10 digit number",
  })
  mobileNo!: string;

  @IsString()
  @Matches(/^\d{6}$/, {
    message: "otp must be a 6 digit number",
  })
  otp!: string;

  @IsEnum(USER_TYPES, {
    message: "userType must be either vendor or customer",
  })
  userType!: UserType;
}
