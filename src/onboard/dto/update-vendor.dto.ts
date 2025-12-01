import {
  IsArray,
  IsBoolean,
  IsEmail,
  IsLatitude,
  IsLongitude,
  IsNumber,
  IsOptional,
  IsString,
  Matches,
  Min,
  IsUrl,
  ValidateNested,
} from "class-validator";
import { Type } from "class-transformer";
import { BreakDto } from "./break.dto.js";
import { DayDto } from "./day.dto.js";

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

  @IsString()
  @IsOptional()
  address?: string;

  @IsString()
  @IsOptional()
  landmark?: string;

  @IsString()
  @IsUrl()
  @IsOptional()
  googleMapLink?: string;

  @IsString()
  @IsOptional()
  city?: string;

  @IsString()
  @IsOptional()
  pincode?: string;

  @IsNumber()
  @IsLatitude()
  @IsOptional()
  latitude?: number;

  @IsNumber()
  @IsLongitude()
  @IsOptional()
  longitude?: number;

  @IsString()
  @IsOptional()
  ownerName?: string;

  @IsString()
  @IsEmail()
  @IsOptional()
  businessEmail?: string;

  @IsString()
  @Matches(/^\d{10}$/, {
    message: "alternatePhoneNumber must be a 10 digit number",
  })
  @IsOptional()
  alternatePhoneNumber?: string;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  working_days?: string[];

  @IsString()
  @Matches(/^([0-1][0-9]|2[0-3]):[0-5][0-9]$/, {
    message: "start_time must be in HH:MM format (24-hour)",
  })
  @IsOptional()
  start_time?: string;

  @IsString()
  @Matches(/^([0-1][0-9]|2[0-3]):[0-5][0-9]$/, {
    message: "end_time must be in HH:MM format (24-hour)",
  })
  @IsOptional()
  end_time?: string;

  @IsBoolean()
  @IsOptional()
  has_break_hours?: boolean;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => BreakDto)
  @IsOptional()
  breaks?: BreakDto[];

  @IsBoolean()
  @IsOptional()
  different_timings_each_day?: boolean;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => DayDto)
  @IsOptional()
  days?: DayDto[];

  @IsBoolean()
  @IsOptional()
  isOnBoardCompleted?: boolean;
}
