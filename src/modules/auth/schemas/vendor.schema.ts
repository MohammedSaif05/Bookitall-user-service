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
        serviceName: String,
        serviceDuration: Number,
        serviceCost: Number,
        gender: {
          type: String,
          enum: ["male", "female", "both"],
        },
        description: String,
        category: String,
        bufferTime: Number,
        assignedStaff: [String],
        maximumNo: Number,
        serviceImage: String,
        isActive: { type: Boolean, default: true },
      },
    ],
  })
  services?: Array<{
    serviceId: string;
    serviceName: string;
    serviceDuration: number;
    serviceCost: number;
    gender: "male" | "female" | "both";
    description?: string;
    category?: string;
    bufferTime?: number;
    assignedStaff?: string[];
    maximumNo?: number;
    serviceImage?: string;
    isActive?: boolean;
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
