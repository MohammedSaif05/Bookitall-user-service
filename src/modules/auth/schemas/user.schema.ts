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

  @Prop({
    type: [
      {
        deviceId: { type: String, required: true },
        platform: { type: String, required: true },
        fcmToken: { type: String, required: true },
        appVersion: { type: String, required: true },
        lastActiveAt: { type: Date, required: true },
      },
    ],
    default: [],
  })
  devices?: Array<{
    deviceId: string;
    platform: string;
    fcmToken: string;
    appVersion: string;
    lastActiveAt: Date;
  }>;

  createdAt?: Date;
  updatedAt?: Date;
}

export type UserDocument = User & Document;
export const UserSchema = SchemaFactory.createForClass(User);
