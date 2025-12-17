import {
  IsArray,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Min,
} from "class-validator";

const GENDERS = ["male", "female", "both"] as const;
type Gender = (typeof GENDERS)[number];

export class UpdateVendorServiceDto {
  @IsString()
  @IsNotEmpty()
  userId!: string;

  @IsString()
  @IsNotEmpty()
  serviceId!: string;

  @IsString()
  @IsOptional()
  serviceName?: string;

  @IsNumber()
  @Min(1)
  @IsOptional()
  serviceDuration?: number;

  @IsNumber()
  @Min(0)
  @IsOptional()
  serviceCost?: number;

  @IsEnum(GENDERS)
  @IsOptional()
  gender?: Gender;

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

