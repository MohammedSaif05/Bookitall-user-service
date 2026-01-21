import {
  IsArray,
  IsBoolean,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Min,
  ValidateNested,
  ValidateIf,
} from "class-validator";
import { Transform, Type } from "class-transformer";

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

export class VendorServiceItemDto {
  // Common mandatory fields
  @IsEnum(CATEGORIES)
  @IsNotEmpty()
  category!: Category;

  @IsString()
  @IsNotEmpty()
  serviceName!: string;

  @IsString()
  @IsNotEmpty()
  serviceImage!: string;

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

  // Shared fields (TURF + SWIMMING-POOL)
  @ValidateIf(
    (o: VendorServiceItemDto) =>
      o.category === "turf" || o.category === "swimming-pool",
  )
  @IsString()
  @IsNotEmpty()
  sportType?: string;

  @ValidateIf(
    (o: VendorServiceItemDto) =>
      o.category === "turf" || o.category === "swimming-pool",
  )
  @IsNumber()
  @Min(1)
  slotDurationInMinutes?: number;

  @ValidateIf((o: VendorServiceItemDto) => o.category === "turf")
  @IsNumber()
  @Min(0)
  pricePerSlot?: number;

  @ValidateIf((o: VendorServiceItemDto) => o.category === "turf")
  @IsNumber()
  @Min(1)
  maxPlayers?: number;

  @ValidateIf(
    (o: VendorServiceItemDto) =>
      o.category === "turf" || o.category === "swimming-pool",
  )
  @IsEnum(GENDERS)
  allowedGenders?: Gender;

  @ValidateIf(
    (o: VendorServiceItemDto) =>
      o.category === "turf" || o.category === "swimming-pool",
  )
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  amenities?: string[];

  // SWIMMING-POOL specific
  @ValidateIf((o: VendorServiceItemDto) => o.category === "swimming-pool")
  @IsNumber()
  @Min(0)
  pricePerPerson?: number;

  @ValidateIf((o: VendorServiceItemDto) => o.category === "swimming-pool")
  @IsNumber()
  @Min(1)
  maxCapacity?: number;

  @ValidateIf((o: VendorServiceItemDto) => o.category === "swimming-pool")
  @IsEnum(AGE_GROUPS)
  ageGroup?: AgeGroup;

  @ValidateIf((o: VendorServiceItemDto) => o.category === "swimming-pool")
  @IsString()
  @IsOptional()
  dressCode?: string;

  // Fields shared by SALOON, SPA, BEAUTY-PARLOUR
  @ValidateIf(
    (o: VendorServiceItemDto) =>
      o.category === "saloon" ||
      o.category === "spa" ||
      o.category === "beauty-parlour",
  )
  @IsNumber()
  @Min(1)
  serviceDurationInMinutes?: number;

  @ValidateIf(
    (o: VendorServiceItemDto) =>
      o.category === "saloon" ||
      o.category === "spa" ||
      o.category === "beauty-parlour",
  )
  @IsNumber()
  @Min(0)
  price?: number;

  // Fields shared by SALOON + BEAUTY-PARLOUR
  @ValidateIf(
    (o: VendorServiceItemDto) =>
      o.category === "saloon" || o.category === "beauty-parlour",
  )
  @IsEnum(GENDERS)
  serviceFor?: Gender;

  @ValidateIf((o: VendorServiceItemDto) => o.category === "saloon")
  @IsNumber()
  @Min(1)
  maxConcurrentBookings?: number;

  @ValidateIf((o: VendorServiceItemDto) => o.category === "saloon")
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  assignedStaff?: string[];

  @ValidateIf((o: VendorServiceItemDto) => o.category === "saloon")
  @IsString()
  @IsOptional()
  categoryLabel?: string;

  // SPA specific
  @ValidateIf((o: VendorServiceItemDto) => o.category === "spa")
  @IsEnum(THERAPIST_GENDERS)
  therapistGender?: TherapistGender;

  @ValidateIf((o: VendorServiceItemDto) => o.category === "spa")
  @IsString()
  @IsOptional()
  roomType?: string;

  // Fields shared by SPA + BEAUTY-PARLOUR
  @ValidateIf(
    (o: VendorServiceItemDto) =>
      o.category === "spa" || o.category === "beauty-parlour",
  )
  @IsString()
  @IsOptional()
  treatmentCategory?: string;

  @ValidateIf(
    (o: VendorServiceItemDto) =>
      o.category === "spa" || o.category === "beauty-parlour",
  )
  @IsNumber()
  @Min(1)
  maxConcurrentSessions?: number;

  @ValidateIf((o: VendorServiceItemDto) => o.category === "beauty-parlour")
  @IsString()
  @IsOptional()
  beauticianLevel?: string;

  @ValidateIf((o: VendorServiceItemDto) => o.category === "beauty-parlour")
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  productsUsed?: string[];
}

// DTO for JSON endpoint - only service data (no userId in body)
export class AddVendorServiceJsonDto {
  @ValidateNested()
  @Type(() => VendorServiceItemDto)
  service!: VendorServiceItemDto;
}

// DTO for FormData endpoint - with userId and service
export class AddVendorServiceDto {
  @IsString()
  @IsNotEmpty()
  userId!: string;

  @Transform(({ value }) => {
    // Handle null, undefined, or "null" string
    if (value === null || value === undefined || value === "null") {
      return undefined;
    }
    // If it's a string, try to parse it as JSON (for FormData)
    if (typeof value === "string") {
      try {
        return JSON.parse(value) as VendorServiceItemDto;
      } catch {
        // If parsing fails, return as-is (will fail validation, which is correct)
        return value;
      }
    }
    // If it's already an object (for JSON body), return as-is
    return value as VendorServiceItemDto;
  })
  @ValidateNested()
  @Type(() => VendorServiceItemDto)
  service!: VendorServiceItemDto;
}
