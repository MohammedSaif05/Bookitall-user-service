import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import {
  Vendor,
  VendorDocument,
} from "../modules/auth/schemas/vendor.schema.js";
import { UpdateVendorDto } from "./dto/update-vendor.dto.js";

@Injectable()
export class OnboardService {
  constructor(
    @InjectModel(Vendor.name)
    private readonly vendorModel: Model<VendorDocument>,
  ) {}

  async updateVendor(
    userId: string,
    updateVendorDto: UpdateVendorDto,
  ) {
    // Validate that userId in body matches userId in route parameter
    if (updateVendorDto.userId !== userId) {
      throw new BadRequestException(
        "userId in request body does not match userId in route parameter",
      );
    }

    // Find the vendor by userId
    const vendor = await this.vendorModel.findOne({ userId }).exec();

    if (!vendor) {
      throw new NotFoundException(`Vendor with userId ${userId} not found`);
    }

    // Update the vendor with the new fields
    vendor.step = updateVendorDto.step;
    vendor.isOnBoardCompleted = updateVendorDto.step >= 4;
    if (updateVendorDto.isBusinessVerified !== undefined) {
      vendor.isBusinessVerified = updateVendorDto.isBusinessVerified;
    }
    if (updateVendorDto.businessName !== undefined) {
      vendor.businessName = updateVendorDto.businessName;
    }
    if (updateVendorDto.businessCategory !== undefined) {
      vendor.businessCategory = updateVendorDto.businessCategory;
    }
    if (updateVendorDto.businessType !== undefined) {
      vendor.businessType = updateVendorDto.businessType;
    }
    if (updateVendorDto.address !== undefined) {
      vendor.address = updateVendorDto.address;
    }
    if (updateVendorDto.landmark !== undefined) {
      vendor.landmark = updateVendorDto.landmark;
    }
    if (updateVendorDto.googleMapLink !== undefined) {
      vendor.googleMapLink = updateVendorDto.googleMapLink;
    }
    if (updateVendorDto.city !== undefined) {
      vendor.city = updateVendorDto.city;
    }
    if (updateVendorDto.pincode !== undefined) {
      vendor.pincode = updateVendorDto.pincode;
    }
    if (updateVendorDto.latitude !== undefined) {
      vendor.latitude = updateVendorDto.latitude;
    }
    if (updateVendorDto.longitude !== undefined) {
      vendor.longitude = updateVendorDto.longitude;
    }
    if (updateVendorDto.ownerName !== undefined) {
      vendor.ownerName = updateVendorDto.ownerName;
    }
    if (updateVendorDto.businessEmail !== undefined) {
      vendor.businessEmail = updateVendorDto.businessEmail;
    }
    if (updateVendorDto.alternatePhoneNumber !== undefined) {
      vendor.alternatePhoneNumber = updateVendorDto.alternatePhoneNumber;
    }
    if (updateVendorDto.working_days !== undefined) {
      vendor.workingDays = updateVendorDto.working_days;
    }
    if (updateVendorDto.start_time !== undefined) {
      vendor.startTime = updateVendorDto.start_time;
    }
    if (updateVendorDto.end_time !== undefined) {
      vendor.endTime = updateVendorDto.end_time;
    }
    if (updateVendorDto.has_break_hours !== undefined) {
      vendor.hasBreakHours = updateVendorDto.has_break_hours;
    }
    if (updateVendorDto.breaks !== undefined) {
      vendor.breaks = updateVendorDto.breaks;
    }
    if (updateVendorDto.different_timings_each_day !== undefined) {
      vendor.differentTimingsEachDay = updateVendorDto.different_timings_each_day;
    }
    if (updateVendorDto.days !== undefined) {
      vendor.days = updateVendorDto.days;
    }

    // Save the updated vendor
    try {
      const savedVendor = await vendor.save();
      return this.sanitizeVendor(savedVendor);
    } catch (error) {
      throw new BadRequestException(
        `Failed to update vendor: ${error instanceof Error ? error.message : "Unknown error"}`,
      );
    }
  }

  async getVendorsByLocation(location: string) {
    const trimmedLocation = location?.trim();
    if (!trimmedLocation) {
      throw new BadRequestException("location is required");
    }

    const regex = new RegExp(
      `^${this.escapeRegExp(trimmedLocation)}$`,
      "i",
    );

    const vendors = await this.vendorModel
      .find({
        city: { $regex: regex },
        isBusinessVerified: true,
      })
      .lean()
      .exec();

    return vendors.map((vendor) => this.sanitizeVendor(vendor));
  }

  private sanitizeVendor(
    vendor: VendorDocument | Record<string, unknown>,
  ): Record<string, unknown> {
    const vendorObject: Record<string, unknown> =
      typeof (vendor as VendorDocument).toObject === "function"
        ? (vendor as VendorDocument).toObject()
        : { ...(vendor as Record<string, unknown>) };

    const result: Record<string, unknown> = {
      ...vendorObject,
    };

    if (vendorObject._id) {
      result._id = this.toStringId(vendorObject._id);
    }

    result.breaks = this.sanitizeBreaks(result.breaks);
    result.days = this.sanitizeDays(result.days);

    return result;
  }

  private sanitizeBreaks(
    breaks: unknown,
  ): Array<Record<string, unknown>> | unknown {
    if (!Array.isArray(breaks)) {
      return breaks;
    }

    return breaks.map((breakItem: unknown) => {
      const breakObj = breakItem as Record<string, unknown>;
      const { _id, ...rest } = breakObj;
      return rest;
    });
  }

  private sanitizeDays(days: unknown): Array<Record<string, unknown>> | unknown {
    if (!Array.isArray(days)) {
      return days;
    }

    return days.map((dayItem: unknown) => {
      const dayObj = dayItem as Record<string, unknown>;
      const { _id, breaks, ...dayRest } = dayObj;
      const sanitizedDay: Record<string, unknown> = { ...dayRest };
      sanitizedDay.breaks = this.sanitizeBreaks(breaks);
      return sanitizedDay;
    });
  }

  private toStringId(value: unknown): string | undefined {
    if (!value) {
      return undefined;
    }
    if (typeof value === "string") {
      return value;
    }
    if (
      typeof value === "object" &&
      value !== null &&
      "toString" in value &&
      typeof (value as { toString: () => string }).toString === "function"
    ) {
      return (value as { toString: () => string }).toString();
    }
    return undefined;
  }

  private escapeRegExp(value: string): string {
    return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  }
}
