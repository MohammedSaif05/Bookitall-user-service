import { IsEnum, IsNotEmpty, IsString } from "class-validator";

export class CreatePromotionRequestDto {
  @IsString()
  @IsNotEmpty()
  vendorId!: string;

  @IsEnum(["offer", "featured"], {
    message: "category must be either 'offer' or 'featured'",
  })
  @IsNotEmpty()
  category!: "offer" | "featured";

  @IsString()
  @IsNotEmpty()
  description!: string;

  @IsEnum(["weekly", "monthly"], {
    message: "durationType must be either 'weekly' or 'monthly'",
  })
  @IsNotEmpty()
  durationType!: "weekly" | "monthly";
}
