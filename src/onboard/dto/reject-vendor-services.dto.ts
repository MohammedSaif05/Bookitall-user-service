import { IsNotEmpty, IsString } from "class-validator";

export class RejectVendorServicesDto {
  @IsString()
  @IsNotEmpty()
  userId!: string;

  @IsString()
  @IsNotEmpty()
  message!: string;
}

