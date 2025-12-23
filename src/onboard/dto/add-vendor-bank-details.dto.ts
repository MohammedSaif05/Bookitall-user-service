import { IsNotEmpty, IsString, Matches, ValidateNested } from "class-validator";
import { Transform, Type } from "class-transformer";

export class BankDetailsItemDto {
  @IsString()
  @IsNotEmpty()
  accountNumber!: string;

  @Transform(({ value }) => {
    if (typeof value === "string") {
      return value.toUpperCase();
    }
    return value as string;
  })
  @IsString()
  @IsNotEmpty()
  @Matches(/^[A-Z]{4}0[A-Z0-9]{6}$/, {
    message:
      "IFSC code must be in format: 4 uppercase letters, 0, followed by 6 alphanumeric characters (e.g., SBIN0001234)",
  })
  ifscCode!: string;

  @IsString()
  @IsNotEmpty()
  accountHolderName!: string;
}

export class AddVendorBankDetailsDto {
  @IsString()
  @IsNotEmpty()
  userId!: string;

  @ValidateNested()
  @Type(() => BankDetailsItemDto)
  bankDetails!: BankDetailsItemDto;
}
