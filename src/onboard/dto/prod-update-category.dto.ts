import {
  IsString,
  IsNumber,
  Min,
  IsUrl,
  IsOptional,
  IsBoolean,
} from "class-validator";

export class ProdUpdateCategoryDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsString()
  @IsUrl()
  @IsOptional()
  image?: string;

  @IsNumber()
  @Min(0)
  @IsOptional()
  order?: number;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}
