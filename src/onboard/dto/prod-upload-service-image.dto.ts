import { IsNotEmpty, IsString } from "class-validator";

export class ProdUploadServiceImageDto {
  @IsString()
  @IsNotEmpty()
  businessId!: string;
}
