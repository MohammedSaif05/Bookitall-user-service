import { IsNotEmpty, IsString } from "class-validator";

export class DeleteVendorStaffDto {
  @IsString()
  @IsNotEmpty()
  name!: string;
}
