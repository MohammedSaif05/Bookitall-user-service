import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document } from "mongoose";

@Schema({
  timestamps: true,
  collection: "vendors",
})
export class Vendor {
  @Prop({ required: true, unique: true })
  userId!: string;

  @Prop({ required: true, unique: true })
  mobileNo!: string;

  @Prop({ type: Number })
  step?: number;

  @Prop({ type: String })
  businessName?: string;

  @Prop({ type: String })
  businessCategory?: string;

  @Prop({ type: String })
  businessType?: string;

  @Prop({ type: String })
  address?: string;

  @Prop({ type: String })
  landmark?: string;

  @Prop({ type: String })
  googleMapLink?: string;

  @Prop({ type: String })
  city?: string;

  @Prop({ type: String })
  pincode?: string;

  @Prop({ type: Number })
  latitude?: number;

  @Prop({ type: Number })
  longitude?: number;

  @Prop({ type: String })
  ownerName?: string;

  @Prop({ type: String })
  businessEmail?: string;

  @Prop({ type: String })
  alternatePhoneNumber?: string;

  @Prop({ type: [String] })
  workingDays?: string[];

  @Prop({ type: String })
  startTime?: string;

  @Prop({ type: String })
  endTime?: string;

  @Prop({ type: Boolean })
  hasBreakHours?: boolean;

  @Prop({
    type: [
      {
        break_start: String,
        break_end: String,
      },
    ],
  })
  breaks?: Array<{ break_start: string; break_end: string }>;

  @Prop({ type: Boolean })
  differentTimingsEachDay?: boolean;

  @Prop({
    type: [
      {
        day: String,
        start_time: String,
        end_time: String,
        breaks: [
          {
            break_start: String,
            break_end: String,
          },
        ],
      },
    ],
  })
  days?: Array<{
    day: string;
    start_time: string;
    end_time: string;
    breaks: Array<{ break_start: string; break_end: string }>;
  }>;

  @Prop({ type: Boolean, default: false })
  isOnBoardCompleted?: boolean;

  @Prop({ type: Boolean, default: false })
  isBusinessVerified?: boolean;

  @Prop({ type: [String] })
  businessImages?: string[];

  @Prop({ type: String })
  businessDocument?: string;

  @Prop({ type: Boolean, default: null })
  isBusinessImageApproved?: boolean | null;

  @Prop({ type: String })
  imageRejectMessage?: string;

  @Prop({ type: Boolean, default: null })
  isBusinessDocumentApproved?: boolean | null;

  @Prop({ type: String })
  documentRejectMessage?: string;

  @Prop({ type: String })
  serviceRejectMessage?: string;

  @Prop({ type: String })
  bankRejectMessage?: string;

  @Prop({ type: String, unique: true, sparse: true })
  shopId?: string;

  @Prop({
    type: [
      {
        name: { type: String, required: true },
        isActive: { type: Boolean, default: true },
      },
    ],
    default: [],
  })
  staff?: Array<{ name: string; isActive: boolean }>;

  @Prop({
    type: [
      {
        serviceId: { type: String, required: true, unique: false },
        category: String,
        serviceName: String,
        serviceImage: String,
        isActive: { type: Boolean, default: true },
        isDiscoverable: { type: Boolean, default: true },
        bufferTimeInMinutes: Number,
        priceUnitLabel: String,

        // Turf + swimming-pool shared fields
        sportType: String,
        slotDurationInMinutes: Number,
        allowedGenders: {
          type: String,
          enum: ["male", "female", "mixed"],
        },
        amenities: [String],

        // Turf specific
        pricePerSlot: Number,
        maxPlayers: Number,

        // Swimming-pool specific
        pricePerPerson: Number,
        maxCapacity: Number,
        ageGroup: {
          type: String,
          enum: ["adults", "children"],
        },
        dressCode: String,

        // Saloon / Spa / beauty-parlor shared
        serviceDurationInMinutes: Number,
        price: Number,

        // Saloon + beauty-parlor
        serviceFor: {
          type: String,
          enum: ["male", "female", "mixed"],
        },
        maxConcurrentBookings: Number,
        assignedStaff: [String],
        categoryLabel: String,

        // Spa specific
        therapistGender: {
          type: String,
          enum: ["male", "female"],
        },
        maxConcurrentSessions: Number,
        roomType: String,
        treatmentCategory: String,

        // beauty-parlor specific
        beauticianLevel: String,
        productsUsed: [String],

        // Legacy fields kept for backward compatibility
        serviceDuration: Number,
        serviceCost: Number,
        gender: {
          type: String,
          enum: ["male", "female", "both"],
        },
        description: String,
        bufferTime: Number,
        maximumNo: Number,
      },
    ],
    default: [],
  })
  services?: Array<{
    serviceId: string;
    category?: string;
    serviceName: string;
    serviceImage?: string;
    isActive?: boolean;

    // Discoverability & pricing units
    isDiscoverable?: boolean;
    bufferTimeInMinutes?: number;
    priceUnitLabel?: string;

    // Turf + swimming-pool shared
    sportType?: string;
    slotDurationInMinutes?: number;
    allowedGenders?: "male" | "female" | "mixed";
    amenities?: string[];

    // Turf specific
    pricePerSlot?: number;
    maxPlayers?: number;

    // Swimming-pool specific
    pricePerPerson?: number;
    maxCapacity?: number;
    ageGroup?: "adults" | "children";
    dressCode?: string;

    // Saloon / Spa / beauty-parlor shared
    serviceDurationInMinutes?: number;
    price?: number;

    // Saloon + beauty-parlor
    serviceFor?: "male" | "female" | "mixed";
    maxConcurrentBookings?: number;
    assignedStaff?: string[];
    categoryLabel?: string;

    // Spa specific
    therapistGender?: "male" | "female";
    maxConcurrentSessions?: number;
    roomType?: string;
    treatmentCategory?: string;

    // beauty-parlor specific
    beauticianLevel?: string;
    productsUsed?: string[];

    // Legacy fields
    serviceDuration?: number;
    serviceCost?: number;
    gender?: "male" | "female" | "both";
    description?: string;
    bufferTime?: number;
    maximumNo?: number;
  }>;

  @Prop({
    type: [
      {
        accountNumber: { type: String, required: true },
        ifscCode: { type: String, required: true },
        accountHolderName: { type: String, required: true },
      },
    ],
    default: [],
  })
  bankDetails?: Array<{
    accountNumber: string;
    ifscCode: string;
    accountHolderName: string;
  }>;
}

export type VendorDocument = Vendor & Document;
export const VendorSchema = SchemaFactory.createForClass(Vendor);
