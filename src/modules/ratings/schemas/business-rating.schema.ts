import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document, Types } from "mongoose";

@Schema({
  timestamps: true,
  collection: "business_ratings",
  versionKey: false,
})
export class BusinessRating {
  @Prop({ type: Types.ObjectId, required: true, ref: "Business", index: true })
  businessId!: Types.ObjectId;

  @Prop({ required: true, index: true })
  userId!: string;

  @Prop({ type: Number, required: true, min: 1, max: 5 })
  rating!: number;

  @Prop({ type: String })
  review?: string;
}

export type BusinessRatingDocument = BusinessRating & Document;
export const BusinessRatingSchema =
  SchemaFactory.createForClass(BusinessRating);

// Create compound index for unique user-business rating
BusinessRatingSchema.index({ businessId: 1, userId: 1 }, { unique: true });
