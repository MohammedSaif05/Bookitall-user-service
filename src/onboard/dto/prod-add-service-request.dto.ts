import {
  IsString,
  IsNotEmpty,
  IsNumber,
  Min,
  IsOptional,
  IsEnum,
  IsUrl,
  IsArray,
  IsBoolean,
  ValidateIf,
} from "class-validator";

const CATEGORIES = [
  "turf",
  "saloon",
  "swimming-pool",
  "spa",
  "beauty-parlour",
] as const;
type Category = (typeof CATEGORIES)[number];

const GENDERS = ["male", "female", "mixed"] as const;
type Gender = (typeof GENDERS)[number];

const THERAPIST_GENDERS = ["male", "female"] as const;
type TherapistGender = (typeof THERAPIST_GENDERS)[number];

const AGE_GROUPS = ["adults", "children"] as const;
type AgeGroup = (typeof AGE_GROUPS)[number];

export class ProdAddServiceRequestDto {
  // Common mandatory fields
  @IsString()
  @IsNotEmpty()
  businessId!: string;

  @IsEnum(CATEGORIES)
  @IsNotEmpty()
  category!: Category;

  @IsString()
  @IsNotEmpty()
  serviceName!: string;

  @IsString()
  @IsUrl()
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
  bufferTimeInMinutes!: number;

  @IsString()
  @IsNotEmpty()
  priceUnitLabel!: string;

  // TURF specific field
  @ValidateIf((o: ProdAddServiceRequestDto) => o.category === "turf")
  @IsString()
  @IsNotEmpty()
  sportType?: string;

  @ValidateIf(
    (o: ProdAddServiceRequestDto) =>
      o.category === "turf" || o.category === "swimming-pool",
  )
  @IsNumber()
  @Min(1)
  slotDurationInMinutes?: number;

  @ValidateIf((o: ProdAddServiceRequestDto) => o.category === "turf")
  @IsNumber()
  @Min(0)
  pricePerSlot?: number;

  @ValidateIf((o: ProdAddServiceRequestDto) => o.category === "turf")
  @IsNumber()
  @Min(1)
  maxPlayers?: number;

  @ValidateIf(
    (o: ProdAddServiceRequestDto) =>
      o.category === "turf" || o.category === "swimming-pool",
  )
  @IsEnum(GENDERS)
  allowedGenders?: Gender;

  @ValidateIf(
    (o: ProdAddServiceRequestDto) =>
      o.category === "turf" || o.category === "swimming-pool",
  )
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  amenities?: string[];

  // SWIMMING-POOL category specific
  @ValidateIf((o: ProdAddServiceRequestDto) => o.category === "swimming-pool")
  @IsNumber()
  @Min(0)
  pricePerPerson?: number;

  @ValidateIf((o: ProdAddServiceRequestDto) => o.category === "swimming-pool")
  @IsNumber()
  @Min(1)
  maxCapacity?: number;

  @ValidateIf((o: ProdAddServiceRequestDto) => o.category === "swimming-pool")
  @IsEnum(AGE_GROUPS)
  ageGroup?: AgeGroup;

  @ValidateIf((o: ProdAddServiceRequestDto) => o.category === "swimming-pool")
  @IsString()
  @IsOptional()
  dressCode?: string;

  // Fields shared by SALOON, SPA, BEAUTY-PARLOUR
  @ValidateIf(
    (o: ProdAddServiceRequestDto) =>
      o.category === "saloon" ||
      o.category === "spa" ||
      o.category === "beauty-parlour",
  )
  @IsNumber()
  @Min(1)
  serviceDurationInMinutes?: number;

  @ValidateIf(
    (o: ProdAddServiceRequestDto) =>
      o.category === "saloon" ||
      o.category === "spa" ||
      o.category === "beauty-parlour",
  )
  @IsNumber()
  @Min(0)
  price?: number;

  @ValidateIf((o: ProdAddServiceRequestDto) => o.category === "saloon")
  @IsNumber()
  @Min(1)
  maxConcurrentBookings?: number;

  @ValidateIf((o: ProdAddServiceRequestDto) => o.category === "saloon")
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  assignedStaff?: string[];

  @ValidateIf((o: ProdAddServiceRequestDto) => o.category === "saloon")
  @IsString()
  @IsOptional()
  categoryLabel?: string;

  // SPA specific
  @ValidateIf((o: ProdAddServiceRequestDto) => o.category === "spa")
  @IsEnum(THERAPIST_GENDERS)
  therapistGender?: TherapistGender;

  @ValidateIf((o: ProdAddServiceRequestDto) => o.category === "spa")
  @IsString()
  @IsOptional()
  roomType?: string;

  // Fields shared by SPA + BEAUTY-PARLOUR
  @ValidateIf(
    (o: ProdAddServiceRequestDto) =>
      o.category === "spa" || o.category === "beauty-parlour",
  )
  @IsString()
  @IsOptional()
  treatmentCategory?: string;

  @ValidateIf(
    (o: ProdAddServiceRequestDto) =>
      o.category === "spa" || o.category === "beauty-parlour",
  )
  @IsNumber()
  @Min(1)
  maxConcurrentSessions?: number;

  // Fields shared by SALOON + BEAUTY-PARLOUR
  @ValidateIf(
    (o: ProdAddServiceRequestDto) =>
      o.category === "saloon" || o.category === "beauty-parlour",
  )
  @IsEnum(GENDERS)
  serviceFor?: Gender;

  // BEAUTY-PARLOUR specific
  @ValidateIf((o: ProdAddServiceRequestDto) => o.category === "beauty-parlour")
  @IsString()
  @IsOptional()
  beauticianLevel?: string;

  @ValidateIf((o: ProdAddServiceRequestDto) => o.category === "beauty-parlour")
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  productsUsed?: string[];
}
