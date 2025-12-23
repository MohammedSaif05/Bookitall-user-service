import { IsNotEmpty, IsString, Matches, ValidateNested } from "class-validator";
import { Type } from "class-transformer";

export class BankDetailsItemDto {
  @IsString()
  @IsNotEmpty()
  accountNumber!: string;

  @IsString()
  @IsNotEmpty()
  @Matches(/^[A-Z]{4}0[A-Z0-9]{6}$/, {
    message:
      "IFSC code must be in format: 4 uppercase letters, 0, followed by 6 alphanumeric characters",
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
