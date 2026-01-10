import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document, Types, Schema as MongooseSchema } from "mongoose";

const LocationSchema = new MongooseSchema(
  {
    type: { type: String, enum: ["Point"], default: "Point" },
    coordinates: { type: [Number] },
  },
  { _id: false },
);

@Schema({
  timestamps: true,
  collection: "services",
  versionKey: false,
})
export class Service {
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

  @Prop({ type: LocationSchema, required: true })
  location!: {
    type: "Point";
    coordinates: [number, number]; // [longitude, latitude]
  };

  @Prop({ type: Boolean, default: true })
  isActive!: boolean;

  @Prop({ type: Boolean, default: true })
  isDiscoverable!: boolean;
}

export type ServiceDocument = Service & Document;
export const ServiceSchema = SchemaFactory.createForClass(Service);

// Create indexes
ServiceSchema.index({ location: "2dsphere" });
ServiceSchema.index({ isActive: 1 });
ServiceSchema.index({ businessId: 1 });
ServiceSchema.index({ vendorId: 1 });
