import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document } from "mongoose";

@Schema({
  timestamps: true,
  collection: "categories",
  versionKey: false,
})
export class Category {
  @Prop({ required: true, unique: true })
  slug!: string;

  @Prop({ required: true })
  name!: string;

  @Prop({ type: String })
  image?: string;

  @Prop({ type: Number, required: true })
  order!: number;

  @Prop({ type: Boolean, default: true })
  isActive!: boolean;
}

export type CategoryDocument = Category & Document;
export const CategorySchema = SchemaFactory.createForClass(Category);

// Create indexes
CategorySchema.index({ slug: 1 }, { unique: true }); // Unique category identity
CategorySchema.index({ isActive: 1, order: 1 }); // App category listing
