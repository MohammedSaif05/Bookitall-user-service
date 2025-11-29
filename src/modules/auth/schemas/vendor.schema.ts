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
}

export type VendorDocument = Vendor & Document;
export const VendorSchema = SchemaFactory.createForClass(Vendor);
