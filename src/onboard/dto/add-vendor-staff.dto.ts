import {
  ArrayMinSize,
  IsArray,
  IsBoolean,
  IsNotEmpty,
  IsString,
  ValidateNested,
} from "class-validator";
import { Type } from "class-transformer";

export class VendorStaffItemDto {
  @IsString()
  @IsNotEmpty()
  name!: string;

  @IsBoolean()
  isActive!: boolean;
}

export class AddVendorStaffDto {
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => VendorStaffItemDto)
  staff!: VendorStaffItemDto[];
}
