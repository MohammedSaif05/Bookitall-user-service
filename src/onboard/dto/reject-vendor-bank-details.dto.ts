import { IsNotEmpty, IsString } from "class-validator";

export class RejectVendorBankDetailsDto {
  @IsString()
  @IsNotEmpty()
  userId!: string;

  @IsString()
  @IsNotEmpty()
  message!: string;
}
