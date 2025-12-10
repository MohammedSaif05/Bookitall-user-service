import { IsNotEmpty, IsString } from "class-validator";

export class RejectVendorDocumentDto {
  @IsString()
  @IsNotEmpty()
  userId!: string;

  @IsString()
  @IsNotEmpty()
  message!: string;
}
