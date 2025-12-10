import { IsNotEmpty, IsString } from "class-validator";

export class UpdateVendorDocumentDto {
  @IsString()
  @IsNotEmpty()
  userId!: string;
}
