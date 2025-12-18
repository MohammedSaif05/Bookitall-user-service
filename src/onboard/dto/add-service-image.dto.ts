import { IsNotEmpty, IsString } from "class-validator";

export class AddServiceImageDto {
  @IsString()
  @IsNotEmpty()
  serviceId!: string;
}
