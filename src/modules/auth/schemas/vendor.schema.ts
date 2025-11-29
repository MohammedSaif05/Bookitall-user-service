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
}

export type VendorDocument = Vendor & Document;
export const VendorSchema = SchemaFactory.createForClass(Vendor);
