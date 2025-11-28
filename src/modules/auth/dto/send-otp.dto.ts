import { IsString, Matches } from "class-validator";

export class SendOtpDto {
  @IsString()
  @Matches(/^\d{10}$/, {
    message: "mobileNo must be a 10 digit number",
  })
  mobileNo!: string;
}
