import {
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Max,
  Min,
} from "class-validator";

export class SubmitRatingDto {
  @IsString()
  @IsNotEmpty()
  userId!: string;

  @IsNumber()
  @IsInt()
  @Min(1)
  @Max(5)
  @IsNotEmpty()
  rating!: number;

  @IsString()
  @IsOptional()
  review?: string;
}
