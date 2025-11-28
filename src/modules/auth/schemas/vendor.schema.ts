import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document } from "mongoose";

@Schema({
  timestamps: true,
})
export class Vendor {
  @Prop({ required: true, unique: true })
  userId!: string;

  @Prop({ required: true, unique: true })
  mobileNo!: string;
}

export type VendorDocument = Vendor & Document;
export const VendorSchema = SchemaFactory.createForClass(Vendor);
