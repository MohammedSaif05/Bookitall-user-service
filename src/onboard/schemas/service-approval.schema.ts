import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document, Types } from "mongoose";

@Schema({
  timestamps: { createdAt: true, updatedAt: false },
  collection: "services_approval",
  versionKey: false,
})
export class ServiceApproval {
  @Prop({ required: true })
  vendorId!: string;

  @Prop({ type: Types.ObjectId, required: true, ref: "Business" })
  businessId!: Types.ObjectId;

  @Prop({ required: true })
  serviceName!: string;

  @Prop({ type: String })
  description?: string;

  @Prop({ type: Number, required: true })
  durationInMinutes!: number;

  @Prop({ type: Number, default: 0 })
  bufferTimeInMinutes!: number;

  @Prop({ type: Number, required: true })
  price!: number;

  @Prop({ type: String })
  category?: string;

  @Prop({ type: String, enum: ["male", "female", "both"] })
  gender?: string;

  @Prop({ type: Number, default: 1 })
  maxBookingsPerSlot!: number;

  @Prop({ type: String })
  serviceImage?: string;

  @Prop({ type: [String], default: [] })
  assignedStaff!: string[];

  @Prop({
    type: String,
    enum: ["pending", "approved", "rejected"],
    default: "pending",
  })
  status!: string;
}

export type ServiceApprovalDocument = ServiceApproval & Document;
export const ServiceApprovalSchema =
  SchemaFactory.createForClass(ServiceApproval);

// Create indexes
ServiceApprovalSchema.index({ status: 1, createdAt: -1 }); // MOST IMPORTANT
ServiceApprovalSchema.index({ vendorId: 1, status: 1 });
ServiceApprovalSchema.index({ businessId: 1 });
