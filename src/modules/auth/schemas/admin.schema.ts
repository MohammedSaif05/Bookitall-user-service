import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document } from "mongoose";

@Schema({
  timestamps: true,
  collection: "admins",
})
export class Admin {
  @Prop({ required: true, unique: true })
  email!: string;

  @Prop({ required: true })
  password!: string;
}

export type AdminDocument = Admin & Document;
export const AdminSchema = SchemaFactory.createForClass(Admin);
