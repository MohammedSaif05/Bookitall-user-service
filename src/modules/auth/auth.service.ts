import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
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
      throw new BadRequestException(
        "Please provide a valid 10-digit mobile number.",
      );
    }

    return {
      success: true,
      message: "OTP sent successfully",
    };
  }

  async verifyOtp(mobileNo: string, otp: string, userType: UserType) {
    if (!this.mobilePattern.test(mobileNo)) {
      throw new BadRequestException(
        "Please provide a valid 10-digit mobile number.",
      );
    }

    if (!USER_TYPES.includes(userType)) {
      throw new BadRequestException(
        "Invalid user type. Please select either 'vendor' or 'customer'.",
      );
    }

    if (otp !== this.demoOtp) {
      throw new BadRequestException(
        "Invalid OTP. Please check the code and try again.",
      );
    }

    const existingUser = await this.userModel.findOne({ mobileNo }).exec();

    if (existingUser) {
      if (existingUser.userType !== userType) {
        existingUser.userType = userType;
        await existingUser.save();
      }
      await this.syncRoleRecords(existingUser.userId, mobileNo, userType);
      return {
        success: true,
        message: "OTP verified successfully",
        userId: existingUser.userId,
      };
    }

    const userId = await this.createUserWithRoleRecord(mobileNo, userType);

    return {
      success: true,
      message: "OTP verified successfully",
      userId,
    };
  }

  private async createUserWithRoleRecord(
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
      await this.syncRoleRecords(userId, mobileNo, userType);
    } catch {
      await this.userModel.deleteOne({ _id: user._id }).exec();
      throw new InternalServerErrorException(
        "Unable to create account. Please try again later.",
      );
    }

    return user.userId;
  }

  private async syncRoleRecords(
    userId: string,
    mobileNo: string,
    userType: UserType,
  ) {
    if (userType === "vendor") {
      await this.vendorModel.updateOne(
        { userId },
        { userId, mobileNo },
        { upsert: true },
      );
      return;
    }

    await this.vendorModel.deleteOne({ userId }).exec();
  }

  async updateCustomerDetails(userId: string, customerName: string) {
    const user = await this.userModel.findOne({ userId }).exec();

    if (!user) {
      throw new NotFoundException(
        "User account not found. Please check your user ID.",
      );
    }

    if (user.userType !== "customer") {
      throw new BadRequestException(
        "This account is not a customer account. Please use the correct account type.",
      );
    }

    user.customerName = customerName;
    await user.save();

    return {
      success: true,
      message: "Customer details updated successfully",
      userId: user.userId,
      customerName: user.customerName,
    };
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
