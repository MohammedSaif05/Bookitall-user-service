import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document, Types, Schema as MongooseSchema } from "mongoose";

const BreakSchema = new MongooseSchema(
  {
    start: { type: String },
    end: { type: String },
  },
  { _id: false },
);

@Schema({
  timestamps: true,
  collection: "service_availability",
  versionKey: false,
})
export class ServiceAvailability {
  @Prop({ type: Types.ObjectId, required: true, ref: "Service" })
  serviceId!: Types.ObjectId;

  @Prop({ type: Types.ObjectId, required: true, ref: "Business" })
  businessId!: Types.ObjectId;

  @Prop({ required: true })
  vendorId!: string;

  @Prop({ type: Number, required: true, min: 0, max: 6 })
  dayOfWeek!: number; // 0 = Sunday, 1 = Monday, ..., 6 = Saturday

  @Prop({ type: String, required: true })
  startTime!: string; // Format: "HH:MM"

  @Prop({ type: String, required: true })
  endTime!: string; // Format: "HH:MM"

  @Prop({ type: [BreakSchema], default: [] })
  breaks!: Array<{ start: string; end: string }>;

  @Prop({ type: Boolean, default: true })
  isActive!: boolean;
}

export type ServiceAvailabilityDocument = ServiceAvailability & Document;
export const ServiceAvailabilitySchema =
  SchemaFactory.createForClass(ServiceAvailability);

// Create indexes
ServiceAvailabilitySchema.index(
  { serviceId: 1, dayOfWeek: 1 },
  { unique: true },
);
ServiceAvailabilitySchema.index({ businessId: 1 });
