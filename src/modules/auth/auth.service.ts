import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
} from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { randomBytes } from "crypto";
import { Model } from "mongoose";
import { USER_TYPES } from "./constants/user-type.constant.js";
import type { UserType } from "./constants/user-type.constant.js";
import { User, UserDocument } from "./schemas/user.schema.js";
import { Vendor, VendorDocument } from "./schemas/vendor.schema.js";

@Injectable()
export class AuthService {
  private readonly demoOtp = "123456";
  private readonly mobilePattern = /^\d{10}$/;

  constructor(
    @InjectModel(User.name)
    private readonly userModel: Model<UserDocument>,
    @InjectModel(Vendor.name)
    private readonly vendorModel: Model<VendorDocument>,
  ) {}

  sendOtp(mobileNo: string) {
    if (!this.mobilePattern.test(mobileNo)) {
      throw new BadRequestException("mobileNo must be a 10 digit number");
    }

    return {
      message: "otp sent successfully",
    };
  }

  async verifyOtp(mobileNo: string, otp: string, userType: UserType) {
    if (!this.mobilePattern.test(mobileNo)) {
      throw new BadRequestException("mobileNo must be a 10 digit number");
    }

    if (!USER_TYPES.includes(userType)) {
      throw new BadRequestException("userType must be vendor or customer");
    }

    if (otp !== this.demoOtp) {
      throw new BadRequestException("invalid otp");
    }

    const existingUser = await this.userModel.findOne({ mobileNo }).exec();

    if (existingUser) {
      if (existingUser.userType !== userType) {
        existingUser.userType = userType;
        await existingUser.save();
      }
      await this.upsertVendorRecord(existingUser.userId, mobileNo);
      return {
        message: "otp verified",
        userId: existingUser.userId,
      };
    }

    const userId = await this.createUserWithVendor(mobileNo, userType);

    return {
      message: "otp verified",
      userId,
    };
  }

  private async createUserWithVendor(
    mobileNo: string,
    userType: UserType,
  ): Promise<string> {
    const userId = await this.generateUniqueUserId();

    const user = await this.userModel.create({
      mobileNo,
      userId,
      userType,
    });

    try {
      await this.upsertVendorRecord(userId, mobileNo);
    } catch {
      await this.userModel.deleteOne({ _id: user._id }).exec();
      throw new InternalServerErrorException(
        "failed to create vendor record for user",
      );
    }

    return user.userId;
  }

  private async upsertVendorRecord(userId: string, mobileNo: string) {
    await this.vendorModel.updateOne(
      { userId },
      { userId, mobileNo },
      { upsert: true },
    );
  }

  private async generateUniqueUserId(): Promise<string> {
    while (true) {
      const userId = randomBytes(10).toString("base64url");

      const exists = await this.userModel.exists({ userId });

      if (!exists) {
        return userId;
      }
    }
  }
}
