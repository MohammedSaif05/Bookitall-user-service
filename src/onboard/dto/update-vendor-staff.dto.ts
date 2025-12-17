import { IsBoolean, IsNotEmpty, IsOptional, IsString } from "class-validator";

export class UpdateVendorStaffDto {
  @IsString()
  @IsNotEmpty()
  currentName!: string;

  @IsString()
  @IsOptional()
  newName?: string;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}
