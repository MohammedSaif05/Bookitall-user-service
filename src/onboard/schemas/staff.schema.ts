import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document, Types } from "mongoose";

@Schema({
  timestamps: { createdAt: true, updatedAt: false },
  collection: "staff",
  versionKey: false,
})
export class Staff {
  @Prop({ required: true })
  vendorId!: string;

  @Prop({ type: Types.ObjectId, required: true, ref: "Business" })
  businessId!: Types.ObjectId;

  @Prop({ required: true })
  name!: string;

  @Prop({ type: Boolean, default: true })
  isActive!: boolean;
}

export type StaffDocument = Staff & Document;
export const StaffSchema = SchemaFactory.createForClass(Staff);
