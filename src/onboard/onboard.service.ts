import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { randomBytes, randomUUID } from "node:crypto";
import { Model } from "mongoose";
import { R2Service } from "../common/storage/r2.service.js";
import {
  Vendor,
  VendorDocument,
} from "../modules/auth/schemas/vendor.schema.js";
import {
  AddVendorServiceDto,
  VendorServiceItemDto,
} from "./dto/add-vendor-service.dto.js";
import { UpdateVendorServiceDto } from "./dto/update-vendor-service.dto.js";
import { DeleteVendorServiceDto } from "./dto/delete-vendor-service.dto.js";
import { AddVendorBankDetailsDto } from "./dto/add-vendor-bank-details.dto.js";
import { UpdateVendorBankDetailsDto } from "./dto/update-vendor-bank-details.dto.js";
import { AddVendorStaffDto } from "./dto/add-vendor-staff.dto.js";
import { UpdateVendorStaffDto } from "./dto/update-vendor-staff.dto.js";
import { DeleteVendorStaffDto } from "./dto/delete-vendor-staff.dto.js";
import { ApproveVendorProductionDto } from "./dto/approve-vendor-production.dto.js";
import { UpdateVendorDto } from "./dto/update-vendor.dto.js";
import { UpdateVendorDocumentDto } from "./dto/update-vendor-document.dto.js";
import { UpdateVendorImagesDto } from "./dto/update-vendor-images.dto.js";
import { RejectVendorDocumentDto } from "./dto/reject-vendor-document.dto.js";
import { RejectVendorImagesDto } from "./dto/reject-vendor-images.dto.js";
import { RejectVendorServicesDto } from "./dto/reject-vendor-services.dto.js";
import { RejectVendorBankDetailsDto } from "./dto/reject-vendor-bank-details.dto.js";

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
      throw new BadRequestException(
        "businessImages must contain exactly 2 files",
      );
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
        newKeys.map((key) =>
          this.r2Service.deleteObject(key).catch(() => undefined),
        ),
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
      throw new BadRequestException(
        "businessDocument must contain exactly 1 file",
      );
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

    // Delete all business images from cloud storage
    if (Array.isArray(vendor.businessImages)) {
      for (const url of vendor.businessImages) {
        try {
          const key = this.r2Service.getKeyFromUrl(url);
          if (key) {
            await this.r2Service.deleteObject(key).catch(() => undefined);
          }
        } catch {
          // Continue with deletion even if image deletion fails
        }
      }
    }

    // Clear businessImages array and set reject message
    vendor.businessImages = [];
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

    // Delete business document from cloud storage
    if (vendor.businessDocument) {
      try {
        const key = this.r2Service.getKeyFromUrl(vendor.businessDocument);
        if (key) {
          await this.r2Service.deleteObject(key).catch(() => undefined);
        }
      } catch {
        // Continue with deletion even if document deletion fails
      }
    }

    // Clear businessDocument field and set reject message
    vendor.businessDocument = undefined;
    vendor.isBusinessDocumentApproved = false;
    vendor.documentRejectMessage = rejectVendorDocumentDto.message;

    const saved = await vendor.save();
    return this.sanitizeVendor(saved);
  }

  async rejectVendorServices(
    userId: string,
    rejectVendorServicesDto: RejectVendorServicesDto,
  ) {
    if (rejectVendorServicesDto.userId !== userId) {
      throw new BadRequestException(
        "userId in request body does not match userId in route parameter",
      );
    }

    const vendor = await this.vendorModel.findOne({ userId }).exec();

    if (!vendor) {
      throw new NotFoundException(`Vendor with userId ${userId} not found`);
    }

    // Delete all service images from cloud storage
    const services = vendor.services ?? [];
    for (const service of services) {
      if (service.serviceImage) {
        try {
          const imageKey = this.r2Service.getKeyFromUrl(service.serviceImage);
          if (imageKey) {
            await this.r2Service.deleteObject(imageKey).catch(() => undefined);
          }
        } catch {
          // Continue with deletion even if image deletion fails
        }
      }
    }

    // Clear services array and set reject message
    vendor.services = [];
    vendor.serviceRejectMessage = rejectVendorServicesDto.message;

    const saved = await vendor.save();
    return this.sanitizeVendor(saved);
  }

  async rejectVendorBankDetails(
    userId: string,
    rejectVendorBankDetailsDto: RejectVendorBankDetailsDto,
  ) {
    if (rejectVendorBankDetailsDto.userId !== userId) {
      throw new BadRequestException(
        "userId in request body does not match userId in route parameter",
      );
    }

    const vendor = await this.vendorModel.findOne({ userId }).exec();

    if (!vendor) {
      throw new NotFoundException(`Vendor with userId ${userId} not found`);
    }

    // Clear bankDetails array and set reject message
    vendor.bankDetails = [];
    vendor.bankRejectMessage = rejectVendorBankDetailsDto.message;

    const saved = await vendor.save();
    return this.sanitizeVendor(saved);
  }

  async addVendorStaff(userId: string, addVendorStaffDto: AddVendorStaffDto) {
    const vendor = await this.vendorModel.findOne({ userId }).exec();

    if (!vendor) {
      throw new NotFoundException(`Vendor with userId ${userId} not found`);
    }

    const staffItems = addVendorStaffDto.staff ?? [];
    if (!Array.isArray(staffItems) || staffItems.length === 0) {
      throw new BadRequestException("staff must contain at least one item");
    }

    const normalizedIncoming = staffItems.map((item, index) => {
      if (!item || typeof item !== "object") {
        throw new BadRequestException(
          `staff item at index ${index} must be an object`,
        );
      }
      if (!item.name || typeof item.name !== "string") {
        throw new BadRequestException(
          `staff item at index ${index} must have a name (string)`,
        );
      }
      const trimmedName = item.name.trim();
      if (!trimmedName) {
        throw new BadRequestException(
          `staff item at index ${index} name cannot be empty`,
        );
      }
      const isActive =
        item.isActive !== undefined ? Boolean(item.isActive) : true;

      return {
        name: trimmedName,
        isActive,
      };
    });

    const incomingLower = normalizedIncoming.map((item) =>
      item.name.toLowerCase(),
    );
    const uniqueIncoming = new Set(incomingLower);
    if (uniqueIncoming.size !== incomingLower.length) {
      throw new BadRequestException("Duplicate staff names in request payload");
    }

    const existingStaff = vendor.staff ?? [];
    const existingLookup = new Set(
      existingStaff.map((staff) => {
        // Handle backward compatibility: staff might be string or object
        const staffName =
          typeof staff === "string" ? staff : (staff as { name: string }).name;
        return staffName.toLowerCase();
      }),
    );

    const duplicateExisting = normalizedIncoming.find((item) =>
      existingLookup.has(item.name.toLowerCase()),
    );
    if (duplicateExisting) {
      throw new BadRequestException(
        `Staff name already exists: ${duplicateExisting.name}`,
      );
    }

    vendor.staff = [...existingStaff, ...normalizedIncoming];
    const saved = await vendor.save();

    return this.sanitizeVendor(saved);
  }

  async updateVendorStaff(
    userId: string,
    updateVendorStaffDto: UpdateVendorStaffDto,
  ) {
    const vendor = await this.vendorModel.findOne({ userId }).exec();

    if (!vendor) {
      throw new NotFoundException(`Vendor with userId ${userId} not found`);
    }

    const existingStaff = vendor.staff ?? [];
    const currentName = updateVendorStaffDto.currentName.trim();

    // Find the staff member to update
    const staffIndex = existingStaff.findIndex((staff) => {
      const staffName =
        typeof staff === "string" ? staff : (staff as { name: string }).name;
      return staffName.toLowerCase() === currentName.toLowerCase();
    });

    if (staffIndex === -1) {
      throw new NotFoundException(
        `Staff member with name "${updateVendorStaffDto.currentName}" not found`,
      );
    }

    const currentStaff = existingStaff[staffIndex];
    const currentStaffObj =
      typeof currentStaff === "string"
        ? { name: currentStaff, isActive: true }
        : (currentStaff as { name: string; isActive: boolean });

    // If newName is provided, validate it and check for duplicates
    let newName = currentStaffObj.name;
    if (updateVendorStaffDto.newName !== undefined) {
      const trimmedNewName = updateVendorStaffDto.newName.trim();
      if (!trimmedNewName) {
        throw new BadRequestException("newName cannot be empty");
      }

      // Check if new name already exists (excluding current staff)
      const existingLookup = new Set(
        existingStaff
          .filter((_, index) => index !== staffIndex)
          .map((staff) => {
            const staffName =
              typeof staff === "string"
                ? staff
                : (staff as { name: string }).name;
            return staffName.toLowerCase();
          }),
      );

      if (existingLookup.has(trimmedNewName.toLowerCase())) {
        throw new BadRequestException(
          `Staff name already exists: ${trimmedNewName}`,
        );
      }

      newName = trimmedNewName;
    }

    // Update the staff member
    const updatedStaff: { name: string; isActive: boolean } = {
      name: newName,
      isActive:
        updateVendorStaffDto.isActive !== undefined
          ? Boolean(updateVendorStaffDto.isActive)
          : currentStaffObj.isActive,
    };

    existingStaff[staffIndex] = updatedStaff;
    vendor.staff = existingStaff;

    const saved = await vendor.save();
    return this.sanitizeVendor(saved);
  }

  async getVendorStaff(userId: string) {
    const vendor = await this.vendorModel.findOne({ userId }).exec();

    if (!vendor) {
      throw new NotFoundException(`Vendor with userId ${userId} not found`);
    }

    const staff = vendor.staff ?? [];

    // Normalize staff to always return objects with name and isActive
    // Handle backward compatibility for existing string entries
    const normalizedStaff = staff.map((staffMember) => {
      if (typeof staffMember === "string") {
        return {
          name: staffMember,
          isActive: true,
        };
      }
      return {
        name: staffMember.name,
        isActive: staffMember.isActive,
      };
    });

    return normalizedStaff;
  }

  async deleteVendorStaff(
    userId: string,
    deleteVendorStaffDto: DeleteVendorStaffDto,
  ) {
    const vendor = await this.vendorModel.findOne({ userId }).exec();

    if (!vendor) {
      throw new NotFoundException(`Vendor with userId ${userId} not found`);
    }

    const existingStaff = vendor.staff ?? [];
    const nameToDelete = deleteVendorStaffDto.name.trim();

    // Find the staff member to delete
    const staffIndex = existingStaff.findIndex((staff) => {
      const staffName =
        typeof staff === "string" ? staff : (staff as { name: string }).name;
      return staffName.toLowerCase() === nameToDelete.toLowerCase();
    });

    if (staffIndex === -1) {
      throw new NotFoundException(
        `Staff member with name "${deleteVendorStaffDto.name}" not found`,
      );
    }

    // Remove the staff member from the array
    existingStaff.splice(staffIndex, 1);
    vendor.staff = existingStaff;

    const saved = await vendor.save();
    return this.sanitizeVendor(saved);
  }

  async addVendorService(
    userId: string,
    addVendorServiceDto: AddVendorServiceDto,
    files?: {
      serviceImage?: Array<{ buffer: Buffer; mimetype: string }>;
    },
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

    if (!addVendorServiceDto.service) {
      throw new BadRequestException("service is required");
    }

    const service: VendorServiceItemDto = addVendorServiceDto.service;

    const existingServices = vendor.services ?? [];
    const existingStaff = vendor.staff ?? [];

    // Create a lookup set of existing staff names (case-insensitive)
    const existingStaffNames = new Set(
      existingStaff.map((staff) => {
        const staffName =
          typeof staff === "string" ? staff : (staff as { name: string }).name;
        return staffName.toLowerCase();
      }),
    );

    // Validate assignedStaff if provided
    if (service.assignedStaff && Array.isArray(service.assignedStaff)) {
      for (const staffName of service.assignedStaff) {
        if (typeof staffName !== "string") {
          throw new BadRequestException(
            "assignedStaff must contain only strings",
          );
        }
        const trimmedStaffName = staffName.trim();
        if (!trimmedStaffName) {
          throw new BadRequestException(
            "assignedStaff cannot contain empty strings",
          );
        }
        if (!existingStaffNames.has(trimmedStaffName.toLowerCase())) {
          throw new BadRequestException(
            `Staff member "${staffName}" not found in vendor's staff list`,
          );
        }
      }
    }

    const serviceImageFile = files?.serviceImage?.[0];
    let newKey: string | undefined = undefined;
    let uploadedImageUrl: string | undefined = undefined;

    // Upload service image if provided
    try {
      if (serviceImageFile?.buffer && serviceImageFile?.mimetype) {
        newKey = `vendors/${userId}/service-${randomUUID()}`;
        await this.r2Service.uploadObject(
          newKey,
          serviceImageFile.buffer,
          serviceImageFile.mimetype,
        );
        uploadedImageUrl = this.r2Service.getPublicUrl(newKey);
      }

      // Generate serviceId and add service with image
      const serviceId = await this.generateUniqueServiceId(userId);
      const newService: {
        serviceId: string;
        serviceName: string;
        serviceDuration: number;
        serviceCost: number;
        gender: "male" | "female" | "both";
        description?: string;
        category?: string;
        bufferTime?: number;
        assignedStaff?: string[];
        maximumNo?: number;
        serviceImage?: string;
        isActive?: boolean;
      } = {
        ...service,
        serviceId,
        serviceImage: uploadedImageUrl,
        isActive: service.isActive !== undefined ? service.isActive : true, // Default to true
      };

      existingServices.push(newService);
      vendor.services = existingServices;
      const saved = await vendor.save();

      return this.sanitizeVendor(saved);
    } catch (error) {
      // Rollback newly uploaded image on error
      if (newKey) {
        await this.r2Service.deleteObject(newKey).catch(() => undefined);
      }

      throw new BadRequestException(
        `Failed to add service: ${error instanceof Error ? error.message : "Unknown error"}`,
      );
    }
  }

  async addServiceImage(
    userId: string,
    serviceId: string,
    files?: {
      serviceImage?: Array<{ buffer: Buffer; mimetype: string }>;
    },
  ) {
    const vendor = await this.vendorModel.findOne({ userId }).exec();

    if (!vendor) {
      throw new NotFoundException(`Vendor with userId ${userId} not found`);
    }

    const existingServices = vendor.services ?? [];

    // Find the service by serviceId
    const serviceIndex = existingServices.findIndex(
      (svc) => (svc as { serviceId?: string }).serviceId === serviceId,
    );

    if (serviceIndex === -1) {
      throw new NotFoundException(
        `Service with serviceId "${serviceId}" not found`,
      );
    }

    const existingService = existingServices[serviceIndex] as {
      serviceId: string;
      serviceName: string;
      serviceDuration: number;
      serviceCost: number;
      gender: "male" | "female" | "both";
      description?: string;
      category?: string;
      bufferTime?: number;
      assignedStaff?: string[];
      maximumNo?: number;
      serviceImage?: string;
      isActive?: boolean;
    };

    const serviceImageFile = files?.serviceImage?.[0];
    if (!serviceImageFile?.buffer || !serviceImageFile?.mimetype) {
      throw new BadRequestException("serviceImage file is required");
    }

    let newKey: string | undefined = undefined;
    let uploadedImageUrl: string | undefined = undefined;

    try {
      // Upload new image
      newKey = `vendors/${userId}/service-${randomUUID()}`;
      await this.r2Service.uploadObject(
        newKey,
        serviceImageFile.buffer,
        serviceImageFile.mimetype,
      );
      uploadedImageUrl = this.r2Service.getPublicUrl(newKey);

      // Delete old image if it exists
      if (existingService.serviceImage) {
        const oldKey = this.r2Service.getKeyFromUrl(
          existingService.serviceImage,
        );
        if (oldKey) {
          await this.r2Service.deleteObject(oldKey).catch(() => undefined);
        }
      }

      // Update only the serviceImage field - explicitly preserve all fields including serviceId
      const updatedService = {
        serviceId: existingService.serviceId, // Explicitly preserve serviceId
        serviceName: existingService.serviceName,
        serviceDuration: existingService.serviceDuration,
        serviceCost: existingService.serviceCost,
        gender: existingService.gender,
        description: existingService.description,
        category: existingService.category,
        bufferTime: existingService.bufferTime,
        assignedStaff: existingService.assignedStaff,
        maximumNo: existingService.maximumNo,
        isActive:
          existingService.isActive !== undefined
            ? existingService.isActive
            : true,
        serviceImage: uploadedImageUrl, // Update only this field
      };

      existingServices[serviceIndex] = updatedService;
      vendor.services = existingServices;
      const saved = await vendor.save();

      return this.sanitizeVendor(saved);
    } catch (error) {
      // Rollback newly uploaded image on error
      if (newKey) {
        await this.r2Service.deleteObject(newKey).catch(() => undefined);
      }

      throw new BadRequestException(
        `Failed to add service image: ${error instanceof Error ? error.message : "Unknown error"}`,
      );
    }
  }

  async deleteVendorService(
    userId: string,
    deleteVendorServiceDto: DeleteVendorServiceDto,
  ) {
    const vendor = await this.vendorModel.findOne({ userId }).exec();

    if (!vendor) {
      throw new NotFoundException(`Vendor with userId ${userId} not found`);
    }

    const existingServices = vendor.services ?? [];
    const serviceId = deleteVendorServiceDto.serviceId;

    // Find the service by serviceId
    const serviceIndex = existingServices.findIndex(
      (svc) => (svc as { serviceId?: string }).serviceId === serviceId,
    );

    if (serviceIndex === -1) {
      throw new NotFoundException(
        `Service with serviceId "${serviceId}" not found`,
      );
    }

    const serviceToDelete = existingServices[serviceIndex] as {
      serviceImage?: string;
    };

    // Delete the service image from storage if it exists
    if (serviceToDelete.serviceImage) {
      try {
        const imageKey = this.r2Service.getKeyFromUrl(
          serviceToDelete.serviceImage,
        );
        if (imageKey) {
          await this.r2Service.deleteObject(imageKey).catch(() => undefined);
        }
      } catch {
        // Continue with deletion even if image deletion fails
      }
    }

    // Remove the service from the array
    existingServices.splice(serviceIndex, 1);
    vendor.services = existingServices;

    const saved = await vendor.save();
    return this.sanitizeVendor(saved);
  }

  async updateVendorService(
    userId: string,
    updateVendorServiceDto: UpdateVendorServiceDto,
    files?: {
      serviceImage?: Array<{ buffer: Buffer; mimetype: string }>;
    },
  ) {
    if (updateVendorServiceDto.userId !== userId) {
      throw new BadRequestException(
        "userId in request body does not match userId in route parameter",
      );
    }

    const vendor = await this.vendorModel.findOne({ userId }).exec();

    if (!vendor) {
      throw new NotFoundException(`Vendor with userId ${userId} not found`);
    }

    const existingServices = vendor.services ?? [];
    const serviceId = updateVendorServiceDto.serviceId;

    // Find the service by serviceId
    const serviceIndex = existingServices.findIndex(
      (svc) => (svc as { serviceId?: string }).serviceId === serviceId,
    );

    if (serviceIndex === -1) {
      throw new NotFoundException(
        `Service with serviceId "${serviceId}" not found`,
      );
    }

    const existingService = existingServices[serviceIndex] as {
      serviceId: string;
      serviceName: string;
      serviceDuration: number;
      serviceCost: number;
      gender: "male" | "female" | "both";
      description?: string;
      category?: string;
      bufferTime?: number;
      assignedStaff?: string[];
      maximumNo?: number;
      serviceImage?: string;
      isActive?: boolean;
    };

    // Validate assignedStaff if provided
    if (updateVendorServiceDto.assignedStaff) {
      const existingStaff = vendor.staff ?? [];
      const existingStaffNames = new Set(
        existingStaff.map((staff) => {
          const staffName =
            typeof staff === "string"
              ? staff
              : (staff as { name: string }).name;
          return staffName.toLowerCase();
        }),
      );

      for (const staffName of updateVendorServiceDto.assignedStaff) {
        if (typeof staffName !== "string") {
          throw new BadRequestException(
            "assignedStaff must contain only strings",
          );
        }
        const trimmedStaffName = staffName.trim();
        if (!trimmedStaffName) {
          throw new BadRequestException(
            "assignedStaff cannot contain empty strings",
          );
        }
        if (!existingStaffNames.has(trimmedStaffName.toLowerCase())) {
          throw new BadRequestException(
            `Staff member "${staffName}" not found in vendor's staff list`,
          );
        }
      }
    }

    let newImageUrl: string | undefined = undefined;
    let newKey: string | undefined = undefined;

    // Handle image upload if provided
    try {
      const serviceImageFile = files?.serviceImage?.[0];
      if (serviceImageFile?.buffer && serviceImageFile?.mimetype) {
        // Upload new image
        newKey = `vendors/${userId}/service-${randomUUID()}`;
        await this.r2Service.uploadObject(
          newKey,
          serviceImageFile.buffer,
          serviceImageFile.mimetype,
        );
        newImageUrl = this.r2Service.getPublicUrl(newKey);

        // Delete old image if it exists
        if (existingService.serviceImage) {
          const oldKey = this.r2Service.getKeyFromUrl(
            existingService.serviceImage,
          );
          if (oldKey) {
            await this.r2Service.deleteObject(oldKey).catch(() => undefined);
          }
        }
      }

      // Update the service - explicitly preserve serviceId
      const updatedService = {
        serviceId: existingService.serviceId, // Explicitly preserve serviceId
        serviceName:
          updateVendorServiceDto.serviceName !== undefined
            ? updateVendorServiceDto.serviceName
            : existingService.serviceName,
        serviceDuration:
          updateVendorServiceDto.serviceDuration !== undefined
            ? updateVendorServiceDto.serviceDuration
            : existingService.serviceDuration,
        serviceCost:
          updateVendorServiceDto.serviceCost !== undefined
            ? updateVendorServiceDto.serviceCost
            : existingService.serviceCost,
        gender:
          updateVendorServiceDto.gender !== undefined
            ? updateVendorServiceDto.gender
            : existingService.gender,
        description:
          updateVendorServiceDto.description !== undefined
            ? updateVendorServiceDto.description
            : existingService.description,
        category:
          updateVendorServiceDto.category !== undefined
            ? updateVendorServiceDto.category
            : existingService.category,
        bufferTime:
          updateVendorServiceDto.bufferTime !== undefined
            ? updateVendorServiceDto.bufferTime
            : existingService.bufferTime,
        assignedStaff:
          updateVendorServiceDto.assignedStaff !== undefined
            ? updateVendorServiceDto.assignedStaff
            : existingService.assignedStaff,
        maximumNo:
          updateVendorServiceDto.maximumNo !== undefined
            ? updateVendorServiceDto.maximumNo
            : existingService.maximumNo,
        isActive:
          updateVendorServiceDto.isActive !== undefined
            ? updateVendorServiceDto.isActive
            : (existingService.isActive ?? true),
        serviceImage:
          newImageUrl !== undefined
            ? newImageUrl
            : existingService.serviceImage,
      };

      existingServices[serviceIndex] = updatedService;
      vendor.services = existingServices;
      const saved = await vendor.save();

      return this.sanitizeVendor(saved);
    } catch (error) {
      // Rollback newly uploaded image on error
      if (newKey) {
        await this.r2Service.deleteObject(newKey).catch(() => undefined);
      }

      throw new BadRequestException(
        `Failed to update service: ${error instanceof Error ? error.message : "Unknown error"}`,
      );
    }
  }

  async addVendorBankDetails(
    userId: string,
    addVendorBankDetailsDto: AddVendorBankDetailsDto,
  ) {
    if (addVendorBankDetailsDto.userId !== userId) {
      throw new BadRequestException(
        "userId in request body does not match userId in route parameter",
      );
    }

    const vendor = await this.vendorModel.findOne({ userId }).exec();

    if (!vendor) {
      throw new NotFoundException(`Vendor with userId ${userId} not found`);
    }

    const existingBankDetails = vendor.bankDetails ?? [];

    // Add new bank details to the array
    existingBankDetails.push(addVendorBankDetailsDto.bankDetails);
    vendor.bankDetails = existingBankDetails;

    const saved = await vendor.save();
    return this.sanitizeVendor(saved);
  }

  async updateVendorBankDetails(
    userId: string,
    updateVendorBankDetailsDto: UpdateVendorBankDetailsDto,
  ) {
    if (updateVendorBankDetailsDto.userId !== userId) {
      throw new BadRequestException(
        "userId in request body does not match userId in route parameter",
      );
    }

    const vendor = await this.vendorModel.findOne({ userId }).exec();

    if (!vendor) {
      throw new NotFoundException(`Vendor with userId ${userId} not found`);
    }

    const existingBankDetails: Array<{
      accountNumber: string;
      ifscCode: string;
      accountHolderName: string;
    }> = vendor.bankDetails ?? [];
    const bankIndex = updateVendorBankDetailsDto.bankIndex;

    if (bankIndex < 0 || bankIndex >= existingBankDetails.length) {
      throw new BadRequestException(
        `Bank details index ${bankIndex} is out of range. Total bank details: ${existingBankDetails.length}`,
      );
    }

    const existingBankDetail = existingBankDetails[bankIndex];

    // Update only the provided fields
    const updatedBankDetail = {
      accountNumber:
        updateVendorBankDetailsDto.accountNumber !== undefined
          ? updateVendorBankDetailsDto.accountNumber
          : existingBankDetail.accountNumber,
      ifscCode:
        updateVendorBankDetailsDto.ifscCode !== undefined
          ? updateVendorBankDetailsDto.ifscCode
          : existingBankDetail.ifscCode,
      accountHolderName:
        updateVendorBankDetailsDto.accountHolderName !== undefined
          ? updateVendorBankDetailsDto.accountHolderName
          : existingBankDetail.accountHolderName,
    };

    existingBankDetails[bankIndex] = updatedBankDetail;
    vendor.bankDetails = existingBankDetails;

    const saved = await vendor.save();
    return this.sanitizeVendor(saved);
  }

  async approveVendorProduction(
    userId: string,
    approveVendorProductionDto: ApproveVendorProductionDto,
  ) {
    if (approveVendorProductionDto.userId !== userId) {
      throw new BadRequestException(
        "userId in request body does not match userId in route parameter",
      );
    }

    const vendor = await this.vendorModel.findOne({ userId }).exec();

    if (!vendor) {
      throw new NotFoundException(`Vendor with userId ${userId} not found`);
    }

    vendor.isBusinessVerified = true;
    vendor.isBusinessImageApproved = true;
    vendor.isBusinessDocumentApproved = true;
    vendor.imageRejectMessage = undefined;
    vendor.documentRejectMessage = undefined;
    if (!vendor.shopId) {
      vendor.shopId = await this.generateUniqueShopId();
    }

    const saved = await vendor.save();
    return this.sanitizeVendor(saved);
  }

  private async generateUniqueShopId(): Promise<string> {
    while (true) {
      const id = randomBytes(6).toString("base64url").slice(0, 10);
      const exists = await this.vendorModel.exists({ shopId: id });
      if (!exists) return id;
    }
  }

  private async generateUniqueServiceId(userId: string): Promise<string> {
    while (true) {
      const id = randomBytes(8).toString("base64url").slice(0, 12);
      const vendor = await this.vendorModel.findOne({ userId }).exec();
      if (!vendor) return id;
      const existingServiceIds = (vendor.services ?? []).map(
        (s) => (s as { serviceId?: string }).serviceId,
      );
      if (!existingServiceIds.includes(id)) return id;
    }
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
          updatedAt: 1,
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
      updatedAt: (vendor as { updatedAt?: Date }).updatedAt,
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
          shopId: 1,
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
      shopId: vendor.shopId,
    }));
  }

  async getVendorByUserId(userId: string) {
    const vendor = await this.vendorModel.findOne({ userId }).exec();

    if (!vendor) {
      throw new NotFoundException(`Vendor with userId ${userId} not found`);
    }

    return this.sanitizeVendor(vendor);
  }

  async getVendorServices(userId: string) {
    const vendor = await this.vendorModel.findOne({ userId }).lean().exec();

    if (!vendor) {
      throw new NotFoundException(`Vendor with userId ${userId} not found`);
    }

    const services = vendor.services || [];
    const sanitizedServices = this.sanitizeServices(services);

    return {
      userId: vendor.userId,
      businessName: vendor.businessName,
      services: sanitizedServices,
    };
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
    result.services = this.sanitizeServices(result.services);
    result.staff = this.sanitizeStaff(result.staff);
    result.bankDetails = this.sanitizeBankDetails(result.bankDetails);

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

  private sanitizeServices(services: unknown): unknown {
    if (!Array.isArray(services)) {
      return services;
    }

    return services.map((serviceItem: unknown) => {
      const serviceObj = serviceItem as Record<string, unknown>;
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { _id, ...rest } = serviceObj;
      return rest;
    });
  }

  private sanitizeStaff(staff: unknown): unknown {
    if (!Array.isArray(staff)) {
      return staff;
    }

    return staff.map((staffItem: unknown) => {
      const staffObj = staffItem as Record<string, unknown>;
      // Handle both string and object formats (backward compatibility)
      if (typeof staffObj === "string") {
        return {
          name: staffObj,
          isActive: true,
        };
      }
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { _id, ...rest } = staffObj;
      return rest;
    });
  }

  private sanitizeBankDetails(bankDetails: unknown): unknown {
    if (!Array.isArray(bankDetails)) {
      return bankDetails;
    }

    return bankDetails.map((bankDetailItem: unknown) => {
      const bankDetailObj = bankDetailItem as Record<string, unknown>;
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { _id, ...rest } = bankDetailObj;
      return rest;
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
