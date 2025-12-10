import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { randomUUID } from "node:crypto";
import { Model } from "mongoose";
import { R2Service } from "../common/storage/r2.service.js";
import {
  Vendor,
  VendorDocument,
} from "../modules/auth/schemas/vendor.schema.js";
import { AddVendorServiceDto } from "./dto/add-vendor-service.dto.js";
import { UpdateVendorDto } from "./dto/update-vendor.dto.js";
import { UpdateVendorDocumentDto } from "./dto/update-vendor-document.dto.js";
import { UpdateVendorImagesDto } from "./dto/update-vendor-images.dto.js";
import { RejectVendorDocumentDto } from "./dto/reject-vendor-document.dto.js";
import { RejectVendorImagesDto } from "./dto/reject-vendor-images.dto.js";

@Injectable()
export class OnboardService {
  constructor(
    @InjectModel(Vendor.name)
    private readonly vendorModel: Model<VendorDocument>,
    private readonly r2Service: R2Service,
  ) {}

  async updateVendor(userId: string, updateVendorDto: UpdateVendorDto) {
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
      vendor.differentTimingsEachDay =
        updateVendorDto.different_timings_each_day;
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

    const regex = new RegExp(`^${this.escapeRegExp(trimmedLocation)}$`, "i");

    const vendors = await this.vendorModel
      .find({
        city: { $regex: regex },
        isBusinessVerified: true,
      })
      .lean()
      .exec();

    return vendors.map((vendor) => this.sanitizeVendor(vendor));
  }

  async getVendorsPendingVerification() {
    const vendors = await this.vendorModel
      .find({
        isOnBoardCompleted: true,
        isBusinessVerified: false,
      })
      .lean()
      .exec();

    return vendors.map((vendor) => this.sanitizeVendor(vendor));
  }

  async updateVendorImages(
    userId: string,
    updateVendorImagesDto: UpdateVendorImagesDto,
    files: { businessImages?: Array<{ buffer: Buffer; mimetype: string }> },
  ) {
    if (updateVendorImagesDto.userId !== userId) {
      throw new BadRequestException(
        "userId in request body does not match userId in route parameter",
      );
    }

    const vendor = await this.vendorModel.findOne({ userId }).exec();

    if (!vendor) {
      throw new NotFoundException(`Vendor with userId ${userId} not found`);
    }

    const images = files.businessImages ?? [];

    if (!Array.isArray(images) || images.length !== 2) {
      throw new BadRequestException("businessImages must contain exactly 2 files");
    }

    const newKeys: string[] = [];
    const newUrls: string[] = [];

    try {
      for (const [index, file] of images.entries()) {
        if (!file.buffer || !file.mimetype) {
          throw new BadRequestException("Invalid file upload");
        }

        const key = `vendors/${userId}/business-${randomUUID()}-${index}`;
        await this.r2Service.uploadObject(key, file.buffer, file.mimetype);
        newKeys.push(key);
        newUrls.push(this.r2Service.getPublicUrl(key));
      }

      // Delete previous images if they existed
      if (Array.isArray(vendor.businessImages)) {
        for (const url of vendor.businessImages) {
          const key = this.r2Service.getKeyFromUrl(url);
          if (key) {
            await this.r2Service.deleteObject(key).catch(() => undefined);
          }
        }
      }

      vendor.businessImages = newUrls;
      const saved = await vendor.save();

      return this.sanitizeVendor(saved);
    } catch (error) {
      // Rollback newly uploaded images
      await Promise.all(
        newKeys.map((key) => this.r2Service.deleteObject(key).catch(() => undefined)),
      );

      throw new BadRequestException(
        `Failed to upload business images: ${error instanceof Error ? error.message : "Unknown error"}`,
      );
    }
  }

  async updateVendorDocument(
    userId: string,
    updateVendorDocumentDto: UpdateVendorDocumentDto,
    files: { businessDocument?: Array<{ buffer: Buffer; mimetype: string }> },
  ) {
    if (updateVendorDocumentDto.userId !== userId) {
      throw new BadRequestException(
        "userId in request body does not match userId in route parameter",
      );
    }

    const vendor = await this.vendorModel.findOne({ userId }).exec();

    if (!vendor) {
      throw new NotFoundException(`Vendor with userId ${userId} not found`);
    }

    const docs = files.businessDocument ?? [];

    if (!Array.isArray(docs) || docs.length !== 1) {
      throw new BadRequestException("businessDocument must contain exactly 1 file");
    }

    const file = docs[0];
    if (!file.buffer || !file.mimetype) {
      throw new BadRequestException("Invalid file upload");
    }

    const newKey = `vendors/${userId}/business-document-${randomUUID()}`;

    try {
      await this.r2Service.uploadObject(newKey, file.buffer, file.mimetype);
      const newUrl = this.r2Service.getPublicUrl(newKey);

      // Delete previous document if it existed
      if (vendor.businessDocument) {
        const prevKey = this.r2Service.getKeyFromUrl(vendor.businessDocument);
        if (prevKey) {
          await this.r2Service.deleteObject(prevKey).catch(() => undefined);
        }
      }

      vendor.businessDocument = newUrl;
      const saved = await vendor.save();

      return this.sanitizeVendor(saved);
    } catch (error) {
      // Rollback newly uploaded doc on failure
      await this.r2Service.deleteObject(newKey).catch(() => undefined);

      throw new BadRequestException(
        `Failed to upload business document: ${error instanceof Error ? error.message : "Unknown error"}`,
      );
    }
  }

  async rejectVendorImages(
    userId: string,
    rejectVendorImagesDto: RejectVendorImagesDto,
  ) {
    if (rejectVendorImagesDto.userId !== userId) {
      throw new BadRequestException(
        "userId in request body does not match userId in route parameter",
      );
    }

    const vendor = await this.vendorModel.findOne({ userId }).exec();

    if (!vendor) {
      throw new NotFoundException(`Vendor with userId ${userId} not found`);
    }

    vendor.isBusinessImageApproved = false;
    vendor.imageRejectMessage = rejectVendorImagesDto.message;

    const saved = await vendor.save();
    return this.sanitizeVendor(saved);
  }

  async rejectVendorDocument(
    userId: string,
    rejectVendorDocumentDto: RejectVendorDocumentDto,
  ) {
    if (rejectVendorDocumentDto.userId !== userId) {
      throw new BadRequestException(
        "userId in request body does not match userId in route parameter",
      );
    }

    const vendor = await this.vendorModel.findOne({ userId }).exec();

    if (!vendor) {
      throw new NotFoundException(`Vendor with userId ${userId} not found`);
    }

    vendor.isBusinessDocumentApproved = false;
    vendor.documentRejectMessage = rejectVendorDocumentDto.message;

    const saved = await vendor.save();
    return this.sanitizeVendor(saved);
  }

  async addVendorService(
    userId: string,
    addVendorServiceDto: AddVendorServiceDto,
  ) {
    if (addVendorServiceDto.userId !== userId) {
      throw new BadRequestException(
        "userId in request body does not match userId in route parameter",
      );
    }

    const vendor = await this.vendorModel.findOne({ userId }).exec();

    if (!vendor) {
      throw new NotFoundException(`Vendor with userId ${userId} not found`);
    }

    const servicesToAdd = addVendorServiceDto.services ?? [];
    if (!Array.isArray(servicesToAdd) || servicesToAdd.length === 0) {
      throw new BadRequestException("services must contain at least one service");
    }

    vendor.services = [...(vendor.services ?? []), ...servicesToAdd];
    const saved = await vendor.save();

    return this.sanitizeVendor(saved);
  }

  async getPendingVendorsList() {
    const vendors = await this.vendorModel
      .find(
        {
          isOnBoardCompleted: true,
          isBusinessVerified: false,
        },
        {
          userId: 1,
          businessName: 1,
          businessType: 1,
          businessCategory: 1,
          city: 1,
          mobileNo: 1,
        },
      )
      .lean()
      .exec();

    return vendors.map((vendor) => ({
      userId: vendor.userId,
      businessName: vendor.businessName,
      businessType: vendor.businessType,
      businessCategory: vendor.businessCategory,
      location: vendor.city,
      mobileNumber: vendor.mobileNo,
    }));
  }

  async getVerifiedVendors() {
    const vendors = await this.vendorModel
      .find({
        isOnBoardCompleted: true,
        isBusinessVerified: true,
      })
      .lean()
      .exec();

    return vendors.map((vendor) => this.sanitizeVendor(vendor));
  }

  async getVerifiedVendorsList() {
    const vendors = await this.vendorModel
      .find(
        {
          isOnBoardCompleted: true,
          isBusinessVerified: true,
        },
        {
          userId: 1,
          businessName: 1,
          businessType: 1,
          businessCategory: 1,
          city: 1,
          mobileNo: 1,
        },
      )
      .lean()
      .exec();

    return vendors.map((vendor) => ({
      userId: vendor.userId,
      businessName: vendor.businessName,
      businessType: vendor.businessType,
      businessCategory: vendor.businessCategory,
      location: vendor.city,
      mobileNumber: vendor.mobileNo,
    }));
  }

  async getVendorByUserId(userId: string) {
    const vendor = await this.vendorModel.findOne({ userId }).exec();

    if (!vendor) {
      throw new NotFoundException(`Vendor with userId ${userId} not found`);
    }

    return this.sanitizeVendor(vendor);
  }

  private sanitizeVendor(
    vendor: VendorDocument | Record<string, unknown>,
  ): Record<string, unknown> {
    const vendorObject: Record<string, unknown> =
      typeof (vendor as VendorDocument).toObject === "function"
        ? ((vendor as VendorDocument).toObject() as Record<string, unknown>)
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

  private sanitizeBreaks(breaks: unknown): unknown {
    if (!Array.isArray(breaks)) {
      return breaks;
    }

    return breaks.map((breakItem: unknown) => {
      const breakObj = breakItem as Record<string, unknown>;
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { _id, ...rest } = breakObj;
      return rest;
    });
  }

  private sanitizeDays(days: unknown): unknown {
    if (!Array.isArray(days)) {
      return days;
    }

    return days.map((dayItem: unknown) => {
      const dayObj = dayItem as Record<string, unknown>;
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
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
