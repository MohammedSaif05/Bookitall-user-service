import { IsNumber, IsOptional } from "class-validator";
import { Type } from "class-transformer";

export class BusinessDetailsDto {
  @IsNumber()
  @IsOptional()
  @Type(() => Number)
  lat?: number;

  @IsNumber()
  @IsOptional()
  @Type(() => Number)
  lng?: number;
}
