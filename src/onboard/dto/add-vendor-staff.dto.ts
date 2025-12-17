import { ArrayMinSize, IsArray, IsNotEmpty, IsString } from "class-validator";

export class AddVendorStaffDto {
  @IsString()
  @IsNotEmpty()
  userId!: string;

  @IsArray()
  @ArrayMinSize(1)
  @IsString({ each: true })
  @IsNotEmpty({ each: true })
  staff!: string[];
}

