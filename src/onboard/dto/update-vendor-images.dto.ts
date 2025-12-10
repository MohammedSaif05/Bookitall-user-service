import { IsNotEmpty, IsString } from "class-validator";

export class UpdateVendorImagesDto {
  @IsString()
  @IsNotEmpty()
  userId!: string;
}
