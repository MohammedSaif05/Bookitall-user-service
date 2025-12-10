import { IsNotEmpty, IsString } from "class-validator";

export class RejectVendorImagesDto {
  @IsString()
  @IsNotEmpty()
  userId!: string;

  @IsString()
  @IsNotEmpty()
  message!: string;
}
