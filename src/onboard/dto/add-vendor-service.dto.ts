import {
  IsArray,
  IsBoolean,
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

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}

// DTO for JSON endpoint - only service data (no userId in body)
export class AddVendorServiceJsonDto {
  @ValidateNested()
  @Type(() => VendorServiceItemDto)
  service!: VendorServiceItemDto;
}

// DTO for FormData endpoint - with userId and service
export class AddVendorServiceDto {
  @IsString()
  @IsNotEmpty()
  userId!: string;

  @Transform(({ value }) => {
    // Handle null, undefined, or "null" string
    if (value === null || value === undefined || value === "null") {
      return undefined;
    }
    // If it's a string, try to parse it as JSON (for FormData)
    if (typeof value === "string") {
      try {
        return JSON.parse(value) as VendorServiceItemDto;
      } catch {
        // If parsing fails, return as-is (will fail validation, which is correct)
        return value;
      }
    }
    // If it's already an object (for JSON body), return as-is
    return value as VendorServiceItemDto;
  })
  @ValidateNested()
  @Type(() => VendorServiceItemDto)
  service!: VendorServiceItemDto;
}
