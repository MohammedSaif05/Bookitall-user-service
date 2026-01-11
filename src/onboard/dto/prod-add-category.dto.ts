import { IsString, IsNotEmpty, IsNumber, Min, IsUrl } from "class-validator";

export class ProdAddCategoryDto {
  @IsString()
  @IsNotEmpty()
  name!: string;

  @IsString()
  @IsUrl()
  @IsNotEmpty()
  image!: string;

  @IsNumber()
  @Min(0)
  order!: number;
}
