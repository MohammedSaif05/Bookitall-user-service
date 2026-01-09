import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document, Schema as MongooseSchema } from "mongoose";

const ContactSchema = new MongooseSchema(
  {
    mobileNo: { type: String },
    alternatePhone: { type: String },
    email: { type: String },
  },
  { _id: false },
);

const AddressSchema = new MongooseSchema(
  {
    address: { type: String },
    city: { type: String },
    landmark: { type: String },
    pincode: { type: String },
  },
  { _id: false },
);

const LocationSchema = new MongooseSchema(
  {
    type: { type: String, enum: ["Point"], default: "Point" },
    coordinates: { type: [Number] },
  },
  { _id: false },
);

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

  @Prop({ type: ContactSchema, required: true })
  contact!: {
    mobileNo: string;
    alternatePhone?: string;
    email?: string;
  };

  @Prop({ type: AddressSchema, required: true })
  address!: {
    address: string;
    city: string;
    landmark?: string;
    pincode: string;
  };

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

export type BusinessDocument = Business & Document;
export const BusinessSchema = SchemaFactory.createForClass(Business);

// Create indexes
BusinessSchema.index({ location: "2dsphere" });
BusinessSchema.index({ isActive: 1 });
BusinessSchema.index({ vendorId: 1 });
