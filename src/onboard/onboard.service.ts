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
      const vendorObject = savedVendor.toObject();
      
      // Convert ObjectId to string for proper JSON serialization
      const result: Record<string, unknown> = {
        ...vendorObject,
        _id: vendorObject._id.toString(),
      };

      // Remove _id from breaks array - always remove _id even if it exists
      if (result.breaks && Array.isArray(result.breaks)) {
        result.breaks = result.breaks.map((breakItem: unknown) => {
          const breakObj = breakItem as Record<string, unknown>;
          // Always destructure to remove _id, even if it doesn't exist
          const { _id, ...rest } = breakObj;
          return rest;
        });
      }

      // Remove _id from days array and their nested breaks
      if (result.days && Array.isArray(result.days)) {
        result.days = result.days.map((dayItem: unknown) => {
          const dayObj = dayItem as Record<string, unknown>;
          // Remove _id from day object
          const { _id: dayId, breaks, ...dayRest } = dayObj;
          
          const processedDay: Record<string, unknown> = { ...dayRest };
          
          // Process breaks within each day - always remove _id
          if (breaks && Array.isArray(breaks)) {
            processedDay.breaks = breaks.map((breakItem: unknown) => {
              const breakObj = breakItem as Record<string, unknown>;
              // Always destructure to remove _id
              const { _id: breakId, ...breakRest } = breakObj;
              return breakRest;
            });
          } else {
            processedDay.breaks = breaks;
          }
          
          return processedDay;
        });
      }

      return result;
    } catch (error) {
      throw new BadRequestException(
        `Failed to update vendor: ${error instanceof Error ? error.message : "Unknown error"}`,
      );
    }
  }
}
