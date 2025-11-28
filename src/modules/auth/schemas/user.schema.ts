import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document } from "mongoose";

@Schema({
  timestamps: true,
})
export class User {
  @Prop({ required: true, unique: true })
  mobileNo!: string;

  @Prop({ required: true, unique: true })
  userId!: string;
}

export type UserDocument = User & Document;
export const UserSchema = SchemaFactory.createForClass(User);
