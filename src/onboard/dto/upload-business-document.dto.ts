import { IsNotEmpty, IsString } from "class-validator";

export class UploadBusinessDocumentDto {
  @IsString()
  @IsNotEmpty()
  userId!: string;
}
