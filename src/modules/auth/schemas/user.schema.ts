import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document } from "mongoose";
import { USER_TYPES } from "../constants/user-type.constant.js";
import type { UserType } from "../constants/user-type.constant.js";

@Schema({
  timestamps: true,
})
export class User {
  @Prop({ required: true, unique: true })
  mobileNo!: string;

  @Prop({ required: true, unique: true })
  userId!: string;

  @Prop({ required: true, enum: USER_TYPES })
  userType!: UserType;

  @Prop({ required: false })
  customerName?: string;

  createdAt?: Date;
  updatedAt?: Date;
}

export type UserDocument = User & Document;
export const UserSchema = SchemaFactory.createForClass(User);
