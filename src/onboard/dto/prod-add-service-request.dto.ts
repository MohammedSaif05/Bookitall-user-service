import {
  IsString,
  IsNotEmpty,
  IsNumber,
  Min,
  IsOptional,
  IsEnum,
  IsUrl,
  IsArray,
} from "class-validator";

const GENDERS = ["male", "female", "both"] as const;
type Gender = (typeof GENDERS)[number];

export class ProdAddServiceRequestDto {
  @IsString()
  @IsNotEmpty()
  businessId!: string;

  @IsString()
  @IsNotEmpty()
  serviceName!: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsNumber()
  @Min(1)
  durationInMinutes!: number;

  @IsNumber()
  @Min(0)
  @IsOptional()
  bufferTimeInMinutes?: number;

  @IsNumber()
  @Min(0)
  price!: number;

  @IsString()
  @IsOptional()
  category?: string;

  @IsEnum(GENDERS)
  @IsOptional()
  gender?: Gender;

  @IsNumber()
  @Min(1)
  @IsOptional()
  maxBookingsPerSlot?: number;

  @IsString()
  @IsUrl()
  @IsNotEmpty()
  serviceImage!: string;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  assignedStaff?: string[];
}
