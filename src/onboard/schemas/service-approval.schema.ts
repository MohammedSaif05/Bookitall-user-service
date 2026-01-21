import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document, Types } from "mongoose";

@Schema({
  timestamps: { createdAt: true, updatedAt: false },
  collection: "services_approval",
  versionKey: false,
})
export class ServiceApproval {
  // Common mandatory fields for all categories
  @Prop({ type: Types.ObjectId, required: true, ref: "Business" })
  businessId!: Types.ObjectId;

  @Prop({ required: true })
  category!: string;

  @Prop({ required: true })
  serviceName!: string;

  @Prop({ type: String, required: true })
  serviceImage!: string;

  @Prop({ type: Boolean, default: true })
  isActive!: boolean;

  @Prop({ type: Boolean, default: true })
  isDiscoverable!: boolean;

  @Prop({ required: true })
  vendorId!: string;

  @Prop({
    type: String,
    enum: ["pending", "approved", "rejected"],
    default: "pending",
  })
  status!: string;

  // Category-specific fields - TURF
  @Prop({ type: String })
  sportType?: string; // Turf: required

  @Prop({ type: Number })
  slotDurationInMinutes?: number; // Turf, Swimming Pool: required

  @Prop({ type: Number, default: 0 })
  bufferTimeInMinutes!: number; // All categories: required

  @Prop({ type: Number })
  pricePerSlot?: number; // Turf: required

  @Prop({ type: String })
  priceUnitLabel?: string; // All categories: required (e.g., "per hour", "per person", "per session")

  @Prop({ type: Number })
  maxPlayers?: number; // Turf: required

  @Prop({ type: String, enum: ["male", "female", "mixed"] })
  allowedGenders?: string; // Turf, Swimming Pool: required

  @Prop({ type: [String], default: [] })
  amenities?: string[]; // Turf, Swimming Pool: optional

  // Category-specific fields - SALOON
  @Prop({ type: Number })
  serviceDurationInMinutes?: number; // Saloon, Spa, Beauty Parlour: required

  @Prop({ type: Number })
  price?: number; // Saloon, Spa, Beauty Parlour: required

  @Prop({ type: String, enum: ["male", "female", "mixed"] })
  serviceFor?: string; // Saloon, Beauty Parlour: required

  @Prop({ type: Number })
  maxConcurrentBookings?: number; // Saloon: required

  @Prop({ type: [String], default: [] })
  assignedStaff?: string[]; // Saloon: optional

  @Prop({ type: String })
  categoryLabel?: string; // Saloon: optional

  // Category-specific fields - SWIMMING POOL
  @Prop({ type: Number })
  pricePerPerson?: number; // Swimming Pool: required

  @Prop({ type: Number })
  maxCapacity?: number; // Swimming Pool: required

  @Prop({ type: String, enum: ["adults", "children"] })
  ageGroup?: string; // Swimming Pool: required

  @Prop({ type: String })
  dressCode?: string; // Swimming Pool: optional

  // Category-specific fields - SPA
  @Prop({ type: String, enum: ["male", "female"] })
  therapistGender?: string; // Spa: required

  @Prop({ type: Number })
  maxConcurrentSessions?: number; // Spa, Beauty Parlour: required

  @Prop({ type: String })
  roomType?: string; // Spa: optional

  @Prop({ type: String })
  treatmentCategory?: string; // Spa, Beauty Parlour: optional

  // Category-specific fields - BEAUTY PARLOUR
  @Prop({ type: String })
  beauticianLevel?: string; // Beauty Parlour: optional

  @Prop({ type: [String], default: [] })
  productsUsed?: string[]; // Beauty Parlour: optional
}

export type ServiceApprovalDocument = ServiceApproval & Document;
export const ServiceApprovalSchema =
  SchemaFactory.createForClass(ServiceApproval);

// Create indexes
ServiceApprovalSchema.index({ status: 1, createdAt: -1 }); // MOST IMPORTANT
ServiceApprovalSchema.index({ vendorId: 1, status: 1 });
ServiceApprovalSchema.index({ businessId: 1 });
