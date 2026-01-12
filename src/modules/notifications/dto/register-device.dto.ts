import { IsNotEmpty, IsString } from "class-validator";

export class RegisterDeviceDto {
  @IsString()
  @IsNotEmpty()
  deviceId!: string;

  @IsString()
  @IsNotEmpty()
  platform!: string;

  @IsString()
  @IsNotEmpty()
  fcmToken!: string;

  @IsString()
  @IsNotEmpty()
  appVersion!: string;
}
