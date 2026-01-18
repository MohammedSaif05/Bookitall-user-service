import {
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Max,
  Min,
} from "class-validator";
import { Type } from "class-transformer";

export class NearbyBusinessesDto {
  @IsNumber()
  @IsNotEmpty()
  @Type(() => Number)
  lat!: number;

  @IsNumber()
  @IsNotEmpty()
  @Type(() => Number)
  lng!: number;

  @IsNumber()
  @IsInt()
  @Min(100)
  @Max(25000)
  @IsOptional()
  @Type(() => Number)
  radius?: number;

  @IsString()
  @IsOptional()
  category?: string;

  @IsNumber()
  @IsInt()
  @Min(1)
  @IsOptional()
  @Type(() => Number)
  page?: number;

  @IsNumber()
  @IsInt()
  @Min(1)
  @Max(20)
  @IsOptional()
  @Type(() => Number)
  limit?: number;

  @IsEnum(["distance", "rating"], {
    message: "sort must be either 'distance' or 'rating'",
  })
  @IsOptional()
  sort?: "distance" | "rating";
}
