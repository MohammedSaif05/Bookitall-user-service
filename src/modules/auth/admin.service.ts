import { Injectable, UnauthorizedException } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { Admin, AdminDocument } from "./schemas/admin.schema.js";

@Injectable()
export class AdminService {
  constructor(
    @InjectModel(Admin.name)
    private readonly adminModel: Model<AdminDocument>,
  ) {}

  async login(email: string, password: string) {
    const admin = await this.adminModel.findOne({ email }).exec();

    if (!admin) {
      throw new UnauthorizedException("Invalid email or password");
    }

    if (admin.password !== password) {
      throw new UnauthorizedException("Invalid email or password");
    }

    return {
      message: "Login successful",
      admin: {
        _id: admin._id.toString(),
        email: admin.email,
      },
    };
  }
}
