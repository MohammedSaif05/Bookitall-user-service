import { IsNotEmpty, IsString, IsUrl } from "class-validator";

export class SaveServiceImageDto {
  @IsString()
  @IsNotEmpty()
  userId!: string;

  @IsString()
  @IsNotEmpty()
  serviceId!: string;

  @IsString()
  @IsUrl()
  @IsNotEmpty()
  imageUrl!: string;
}
