import { IsNotEmpty, IsString } from "class-validator";

export class DeleteVendorServiceDto {
  @IsString()
  @IsNotEmpty()
  serviceId!: string;
}
