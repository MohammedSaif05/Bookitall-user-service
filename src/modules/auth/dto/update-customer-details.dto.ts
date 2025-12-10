import { IsNotEmpty, IsString } from "class-validator";

export class UpdateCustomerDetailsDto {
  @IsString()
  @IsNotEmpty()
  customerName!: string;
}

