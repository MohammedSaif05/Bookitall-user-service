import {
  ArrayMinSize,
  IsArray,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsString,
  Min,
  ValidateNested,
} from "class-validator";
import { Type } from "class-transformer";

const GENDERS = ["male", "female", "both"] as const;
type Gender = (typeof GENDERS)[number];

export class VendorServiceItemDto {
  @IsString()
  @IsNotEmpty()
  serviceName!: string;

  @IsNumber()
  @Min(1)
  serviceDuration!: number;

  @IsNumber()
  @Min(0)
  serviceCost!: number;

  @IsEnum(GENDERS)
  gender!: Gender;
}

export class AddVendorServiceDto {
  @IsString()
  @IsNotEmpty()
  userId!: string;

  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => VendorServiceItemDto)
  services!: VendorServiceItemDto[];
}

