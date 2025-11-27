import { IsString, Matches } from 'class-validator';

export class VerifyOtpDto {
  @IsString()
  @Matches(/^\d{10}$/, {
    message: 'mobileNo must be a 10 digit number',
  })
  mobileNo!: string;

  @IsString()
  @Matches(/^\d{6}$/, {
    message: 'otp must be a 6 digit number',
  })
  otp!: string;
}


