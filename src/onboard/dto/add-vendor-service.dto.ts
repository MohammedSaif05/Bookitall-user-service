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
import { Transform, Type } from "class-transformer";

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

  @Transform(({ value }) => {
    if (value === null || value === undefined || value === "null") {
      return undefined;
    }
    if (typeof value === "string") {
      try {
        return JSON.parse(value) as VendorServiceItemDto;
      } catch {
        return value;
      }
    }
    return value as VendorServiceItemDto;
  })
  @ValidateNested()
  @Type(() => VendorServiceItemDto)
  service!: VendorServiceItemDto;
}
