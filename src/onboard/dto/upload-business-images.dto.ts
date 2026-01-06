import { IsNotEmpty, IsString } from "class-validator";

export class UploadBusinessImagesDto {
  @IsString()
  @IsNotEmpty()
  userId!: string;
}
