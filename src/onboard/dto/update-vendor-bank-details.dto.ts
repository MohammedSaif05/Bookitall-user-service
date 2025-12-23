import {
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Matches,
  Min,
} from "class-validator";

export class UpdateVendorBankDetailsDto {
  @IsString()
  @IsNotEmpty()
  userId!: string;

  @IsNumber()
  @Min(0)
  bankIndex!: number;

  @IsString()
  @IsOptional()
  accountNumber?: string;

  @IsString()
  @IsOptional()
  @Matches(/^[A-Z]{4}0[A-Z0-9]{6}$/, {
    message:
      "IFSC code must be in format: 4 uppercase letters, 0, followed by 6 alphanumeric characters",
  })
  ifscCode?: string;

  @IsString()
  @IsOptional()
  accountHolderName?: string;
}
