import {
  IsArray,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
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

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  @IsOptional()
  category?: string;

  @IsNumber()
  @Min(0)
  @IsOptional()
  bufferTime?: number;

  @IsArray()
  @IsString({ each: true })
  @IsNotEmpty({ each: true })
  @IsOptional()
  assignedStaff?: string[];

  @IsNumber()
  @Min(1)
  @IsOptional()
  maximumNo?: number;
}

export class AddVendorServiceDto {
  @IsString()
  @IsNotEmpty()
  userId!: string;

  @ValidateNested()
  @Type(() => VendorServiceItemDto)
  service!: VendorServiceItemDto;
}
