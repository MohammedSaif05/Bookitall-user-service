import {
  IsArray,
  IsBoolean,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Min,
  ValidateIf,
} from "class-validator";

const CATEGORIES = [
  "turf",
  "saloon",
  "swimming-pool",
  "spa",
  "beauty-parlor",
] as const;
type Category = (typeof CATEGORIES)[number];

const GENDERS = ["male", "female", "mixed"] as const;
type Gender = (typeof GENDERS)[number];

const THERAPIST_GENDERS = ["male", "female"] as const;
type TherapistGender = (typeof THERAPIST_GENDERS)[number];

const AGE_GROUPS = ["adults", "children"] as const;
type AgeGroup = (typeof AGE_GROUPS)[number];

export class UpdateVendorServiceDto {
  @IsString()
  @IsNotEmpty()
  userId!: string;

  @IsString()
  @IsNotEmpty()
  serviceId!: string;

  // Common fields
  @IsEnum(CATEGORIES)
  @IsOptional()
  category?: Category;

  @IsString()
  @IsOptional()
  serviceName?: string;

  @IsString()
  @IsOptional()
  serviceImage?: string;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;

  @IsBoolean()
  @IsOptional()
  isDiscoverable?: boolean;

  @IsNumber()
  @Min(0)
  @IsOptional()
  bufferTimeInMinutes?: number;

  @IsString()
  @IsOptional()
  priceUnitLabel?: string;

  // TURF category fields
  @ValidateIf((o: UpdateVendorServiceDto) => o.category === "turf")
  @IsString()
  @IsOptional()
  sportType?: string;

  @ValidateIf(
    (o: UpdateVendorServiceDto) =>
      o.category === "turf" || o.category === "swimming-pool",
  )
  @IsNumber()
  @Min(1)
  @IsOptional()
  slotDurationInMinutes?: number;

  @ValidateIf(
    (o: UpdateVendorServiceDto) =>
      o.category === "turf" || o.category === undefined,
  )
  @IsNumber()
  @Min(0)
  @IsOptional()
  pricePerSlot?: number;

  @ValidateIf(
    (o: UpdateVendorServiceDto) =>
      o.category === "turf" || o.category === undefined,
  )
  @IsNumber()
  @Min(1)
  @IsOptional()
  maxPlayers?: number;

  @ValidateIf(
    (o: UpdateVendorServiceDto) =>
      o.category === "turf" || o.category === "swimming-pool",
  )
  @IsEnum(GENDERS)
  @IsOptional()
  allowedGenders?: Gender;

  @ValidateIf(
    (o: UpdateVendorServiceDto) =>
      o.category === "turf" || o.category === "swimming-pool",
  )
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  amenities?: string[];

  // SALOON category fields
  @ValidateIf(
    (o: UpdateVendorServiceDto) =>
      o.category === "saloon" ||
      o.category === "spa" ||
      o.category === "beauty-parlor" ||
      o.category === undefined,
  )
  @IsNumber()
  @Min(1)
  @IsOptional()
  serviceDurationInMinutes?: number;

  @ValidateIf(
    (o: UpdateVendorServiceDto) =>
      o.category === "saloon" ||
      o.category === "spa" ||
      o.category === "beauty-parlor" ||
      o.category === undefined,
  )
  @IsNumber()
  @Min(0)
  @IsOptional()
  price?: number;

  @ValidateIf(
    (o: UpdateVendorServiceDto) =>
      o.category === "saloon" ||
      o.category === "beauty-parlor" ||
      o.category === undefined,
  )
  @IsEnum(GENDERS)
  @IsOptional()
  serviceFor?: Gender;

  @ValidateIf(
    (o: UpdateVendorServiceDto) =>
      o.category === "saloon" || o.category === undefined,
  )
  @IsNumber()
  @Min(1)
  @IsOptional()
  maxConcurrentBookings?: number;

  @ValidateIf(
    (o: UpdateVendorServiceDto) =>
      o.category === "saloon" || o.category === undefined,
  )
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  assignedStaff?: string[];

  @ValidateIf(
    (o: UpdateVendorServiceDto) =>
      o.category === "saloon" || o.category === undefined,
  )
  @IsString()
  @IsOptional()
  categoryLabel?: string;

  // SWIMMING_POOL category fields
  @ValidateIf(
    (o: UpdateVendorServiceDto) =>
      o.category === "swimming-pool" || o.category === undefined,
  )
  @IsNumber()
  @Min(0)
  @IsOptional()
  pricePerPerson?: number;

  @ValidateIf(
    (o: UpdateVendorServiceDto) =>
      o.category === "swimming-pool" || o.category === undefined,
  )
  @IsNumber()
  @Min(1)
  @IsOptional()
  maxCapacity?: number;

  @ValidateIf(
    (o: UpdateVendorServiceDto) =>
      o.category === "swimming-pool" || o.category === undefined,
  )
  @IsEnum(AGE_GROUPS)
  @IsOptional()
  ageGroup?: AgeGroup;

  @ValidateIf(
    (o: UpdateVendorServiceDto) =>
      o.category === "swimming-pool" || o.category === undefined,
  )
  @IsString()
  @IsOptional()
  dressCode?: string;

  // SPA category fields
  @ValidateIf(
    (o: UpdateVendorServiceDto) =>
      o.category === "spa" || o.category === undefined,
  )
  @IsEnum(THERAPIST_GENDERS)
  @IsOptional()
  therapistGender?: TherapistGender;

  @ValidateIf(
    (o: UpdateVendorServiceDto) =>
      o.category === "spa" ||
      o.category === "beauty-parlor" ||
      o.category === undefined,
  )
  @IsNumber()
  @Min(1)
  @IsOptional()
  maxConcurrentSessions?: number;

  @ValidateIf(
    (o: UpdateVendorServiceDto) =>
      o.category === "spa" || o.category === undefined,
  )
  @IsString()
  @IsOptional()
  roomType?: string;

  @ValidateIf(
    (o: UpdateVendorServiceDto) =>
      o.category === "spa" ||
      o.category === "beauty-parlor" ||
      o.category === undefined,
  )
  @IsString()
  @IsOptional()
  treatmentCategory?: string;

  // BEAUTY_PARLOUR category fields
  @ValidateIf(
    (o: UpdateVendorServiceDto) =>
      o.category === "beauty-parlor" || o.category === undefined,
  )
  @IsString()
  @IsOptional()
  beauticianLevel?: string;

  @ValidateIf(
    (o: UpdateVendorServiceDto) =>
      o.category === "beauty-parlor" || o.category === undefined,
  )
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  productsUsed?: string[];
}
