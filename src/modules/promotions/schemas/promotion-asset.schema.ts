import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document, Types } from "mongoose";

@Schema({
  timestamps: true,
  collection: "promotion_assets",
  versionKey: false,
})
export class PromotionAsset {
  @Prop({ type: Types.ObjectId, required: true, ref: "PromotionRequest" })
  promotionRequestId!: Types.ObjectId;

  @Prop({ required: true })
  imageUrl!: string;

  @Prop({ type: Boolean, default: false })
  isSelectedByVendor!: boolean;
}

export type PromotionAssetDocument = PromotionAsset & Document;
export const PromotionAssetSchema =
  SchemaFactory.createForClass(PromotionAsset);

// Add indexes
PromotionAssetSchema.index({ promotionRequestId: 1 });
PromotionAssetSchema.index({ promotionRequestId: 1, isSelectedByVendor: 1 });
PromotionAssetSchema.index({ createdAt: -1 });
