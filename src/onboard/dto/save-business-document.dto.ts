import { IsNotEmpty, IsString, IsUrl } from "class-validator";

export class SaveBusinessDocumentDto {
  @IsString()
  @IsNotEmpty()
  userId!: string;

  @IsString()
  @IsUrl()
  @IsNotEmpty()
  documentUrl!: string;
}
