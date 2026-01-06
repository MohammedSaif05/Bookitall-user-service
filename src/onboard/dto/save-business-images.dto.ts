import { IsArray, IsNotEmpty, IsString, IsUrl } from "class-validator";

export class SaveBusinessImagesDto {
  @IsString()
  @IsNotEmpty()
  userId!: string;

  @IsArray()
  @IsUrl({}, { each: true })
  @IsNotEmpty()
  imageUrls!: string[];
}
