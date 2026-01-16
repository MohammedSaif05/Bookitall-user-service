import { IsEnum, IsNotEmpty, IsString } from "class-validator";

export class CreateGlobalPromotionDto {
  @IsEnum(["offer", "featured"], {
    message: "category must be either 'offer' or 'featured'",
  })
  @IsNotEmpty()
  category!: "offer" | "featured";

  @IsString()
  @IsNotEmpty()
  description!: string;
}
