import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document, Types } from "mongoose";

@Schema({
  timestamps: true,
  collection: "promotions",
  versionKey: false,
})
export class Promotion {
  @Prop({ required: true })
  vendorId!: string;

  @Prop({ type: Types.ObjectId, required: true, ref: "PromotionRequest" })
  promotionRequestId!: Types.ObjectId;

  @Prop({ type: Types.ObjectId, required: true, ref: "PromotionAsset" })
  promotionAssetId!: Types.ObjectId;

  @Prop({ required: true })
  imageUrl!: string;

  @Prop({ required: true, enum: ["offer", "featured"] })
  category!: string;

  @Prop({ required: true })
  description!: string;

  @Prop({ required: true, type: Date })
  startDate!: Date;

  @Prop({ required: true, type: Date })
  endDate!: Date;

  @Prop({ type: Boolean, default: true })
  isActive!: boolean;
}

export type PromotionDocument = Promotion & Document;
export const PromotionSchema = SchemaFactory.createForClass(Promotion);

// Add indexes
PromotionSchema.index({ vendorId: 1 });
PromotionSchema.index({ isActive: 1 });
PromotionSchema.index({ startDate: 1, endDate: 1 });
PromotionSchema.index({ isActive: 1, startDate: 1, endDate: 1 });
PromotionSchema.index({ createdAt: -1 });
