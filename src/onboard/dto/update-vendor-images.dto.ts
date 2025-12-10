import { ArrayMaxSize, ArrayMinSize, IsArray, IsString } from "class-validator";

export class UpdateVendorImagesDto {
  @IsString()
  userId!: string;

  @IsArray()
  @ArrayMinSize(2)
  @ArrayMaxSize(2)
  @IsString({ each: true })
  businessImages!: string[];
}

