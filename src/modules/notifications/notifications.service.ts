import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { User, UserDocument } from "../auth/schemas/user.schema.js";

@Injectable()
export class NotificationsService {
  constructor(
    @InjectModel(User.name)
    private readonly userModel: Model<UserDocument>,
  ) {}

  async registerDevice(
    userId: string,
    deviceId: string,
    platform: string,
    fcmToken: string,
    appVersion: string,
  ) {
    const user = await this.userModel.findOne({ userId }).exec();

    if (!user) {
      throw new NotFoundException(`User with userId ${userId} not found`);
    }

    const now = new Date();

    // Case A: devices[] does NOT exist
    if (!user.devices || user.devices.length === 0) {
      user.devices = [
        {
          deviceId,
          platform,
          fcmToken,
          appVersion,
          lastActiveAt: now,
        },
      ];
    } else {
      // Case B: Device already exists (same deviceId)
      const existingDeviceIndex = user.devices.findIndex(
        (device) => device.deviceId === deviceId,
      );

      if (existingDeviceIndex !== -1) {
        // Update existing device
        user.devices[existingDeviceIndex].fcmToken = fcmToken;
        user.devices[existingDeviceIndex].appVersion = appVersion;
        user.devices[existingDeviceIndex].platform = platform;
        user.devices[existingDeviceIndex].lastActiveAt = now;
      } else {
        // Case C: Device does NOT exist - append new device
        user.devices.push({
          deviceId,
          platform,
          fcmToken,
          appVersion,
          lastActiveAt: now,
        });
      }
    }

    // Save user document - update only devices and updatedAt
    await user.save();

    return {
      message: "Device registered successfully",
      userId: user.userId,
      deviceId,
    };
  }
}
