import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document } from "mongoose";

@Schema({
  timestamps: true,
  collection: "businesses",
})
export class Business {
  @Prop({ required: true })
  vendorId!: string;

  @Prop({ required: true })
  businessName!: string;

  @Prop({ required: true })
  businessCategory!: string;

  @Prop({ required: true })
  businessType!: string;

  @Prop({ required: true })
  ownerName!: string;

  @Prop({ type: [String], default: [] })
  images!: string[];

  @Prop({ type: [String], default: [] })
  documents!: string[];

  @Prop({
    type: {
      mobileNo: { type: String, required: true },
      alternatePhone: { type: String },
      email: { type: String },
    },
    required: true,
  })
  contact!: {
    mobileNo: string;
    alternatePhone?: string;
    email?: string;
  };

  @Prop({
    type: {
      address: { type: String, required: true },
      city: { type: String, required: true },
      landmark: { type: String },
      pincode: { type: String, required: true },
    },
    required: true,
  })
  address!: {
    address: string;
    city: string;
    landmark?: string;
    pincode: string;
  };

  @Prop({
    type: {
      type: { type: String, enum: ["Point"], default: "Point" },
      coordinates: { type: [Number], required: true },
    },
    required: true,
  })
  location!: {
    type: "Point";
    coordinates: [number, number]; // [longitude, latitude]
  };

  @Prop({ type: Boolean, default: true })
  isActive!: boolean;

  @Prop({ type: Boolean, default: true })
  isDiscoverable!: boolean;
}

export type BusinessDocument = Business & Document;
export const BusinessSchema = SchemaFactory.createForClass(Business);

// Create indexes
BusinessSchema.index({ location: "2dsphere" });
BusinessSchema.index({ isActive: 1 });
BusinessSchema.index({ vendorId: 1 });
