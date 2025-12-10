import { IsNotEmpty, IsString } from "class-validator";

export class ApproveVendorProductionDto {
  @IsString()
  @IsNotEmpty()
  userId!: string;
}

