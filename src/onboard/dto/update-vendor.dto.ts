import {
  IsEmail,
  IsLatitude,
  IsLongitude,
  IsNumber,
  IsOptional,
  IsString,
  Matches,
  Min,
  IsUrl,
} from "class-validator";

export class UpdateVendorDto {
  @IsString()
  userId!: string;

  @IsNumber()
  @Min(1)
  step!: number;

  @IsString()
  @IsOptional()
  businessName?: string;

  @IsString()
  @IsOptional()
  businessCategory?: string;

  @IsString()
  @IsOptional()
  businessType?: string;

  @IsString()
  @IsOptional()
  address?: string;

  @IsString()
  @IsOptional()
  landmark?: string;

  @IsString()
  @IsUrl()
  @IsOptional()
  googleMapLink?: string;

  @IsString()
  @IsOptional()
  city?: string;

  @IsString()
  @IsOptional()
  pincode?: string;

  @IsNumber()
  @IsLatitude()
  @IsOptional()
  latitude?: number;

  @IsNumber()
  @IsLongitude()
  @IsOptional()
  longitude?: number;

  @IsString()
  @IsOptional()
  ownerName?: string;

  @IsString()
  @IsEmail()
  @IsOptional()
  businessEmail?: string;

  @IsString()
  @Matches(/^\d{10}$/, {
    message: "alternatePhoneNumber must be a 10 digit number",
  })
  @IsOptional()
  alternatePhoneNumber?: string;
}
