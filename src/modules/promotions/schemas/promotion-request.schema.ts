import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document } from "mongoose";

@Schema({
  timestamps: true,
  collection: "promotion_requests",
  versionKey: false,
})
export class PromotionRequest {
  @Prop({ required: true })
  vendorId!: string;

  @Prop({ required: true, enum: ["offer", "featured"] })
  category!: string;

  @Prop({ required: true })
  description!: string;

  @Prop({ required: true, enum: ["weekly", "monthly"] })
  durationType!: string;

  @Prop({
    required: true,
    enum: ["pending", "images_uploaded", "approved", "rejected"],
    default: "pending",
  })
  status!: string;

  createdAt?: Date;
  updatedAt?: Date;
}

export type PromotionRequestDocument = PromotionRequest & Document;
export const PromotionRequestSchema =
  SchemaFactory.createForClass(PromotionRequest);

// Add indexes
PromotionRequestSchema.index({ vendorId: 1 });
PromotionRequestSchema.index({ status: 1 });
PromotionRequestSchema.index({ vendorId: 1, status: 1 });
PromotionRequestSchema.index({ createdAt: -1 });
