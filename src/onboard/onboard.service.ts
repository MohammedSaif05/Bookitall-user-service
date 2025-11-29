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

    // Save the updated vendor
    try {
      const savedVendor = await vendor.save();
      const vendorObject = savedVendor.toObject();
      // Convert ObjectId to string for proper JSON serialization
      return {
        ...vendorObject,
        _id: vendorObject._id.toString(),
      };
    } catch (error) {
      throw new BadRequestException(
        `Failed to update vendor: ${error instanceof Error ? error.message : "Unknown error"}`,
      );
    }
  }
}
