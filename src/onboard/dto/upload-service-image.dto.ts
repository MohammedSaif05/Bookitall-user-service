import { IsNotEmpty, IsString } from "class-validator";

export class UploadServiceImageDto {
  @IsString()
  @IsNotEmpty()
  userId!: string;

  @IsString()
  @IsNotEmpty()
  serviceId!: string;
}
