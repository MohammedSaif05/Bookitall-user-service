import { IsNumber, IsOptional, IsString, Min } from "class-validator";

export class UpdateVendorDto {
  @IsString()
  userId!: string;

  @IsNumber()
  @Min(1)
  step!: number;

  @IsString()
  @IsOptional()
  businessName?: string;

  @IsString()
  @IsOptional()
  businessCategory?: string;

  @IsString()
  @IsOptional()
  businessType?: string;
}
