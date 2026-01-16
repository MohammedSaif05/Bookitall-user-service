import { IsNotEmpty, IsString } from "class-validator";

export class UploadPromotionImagesDto {
  @IsString()
  @IsNotEmpty()
  requestId!: string;
}
