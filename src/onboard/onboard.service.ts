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
import { Business, BusinessDocument } from "./schemas/business.schema.js";
import { Service, ServiceDocument } from "./schemas/service.schema.js";
import { Staff, StaffDocument } from "./schemas/staff.schema.js";
import {
  ServiceAvailability,
  ServiceAvailabilityDocument,
} from "./schemas/service-availability.schema.js";
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
import { RejectVendorDocumentDto } from "./dto/reject-vendor-document.dto.js";
import { RejectVendorImagesDto } from "./dto/reject-vendor-images.dto.js";
import { RejectVendorServicesDto } from "./dto/reject-vendor-services.dto.js";
import { RejectVendorBankDetailsDto } from "./dto/reject-vendor-bank-details.dto.js";
import { UploadBusinessImagesDto } from "./dto/upload-business-images.dto.js";
import { SaveBusinessImagesDto } from "./dto/save-business-images.dto.js";
import { UploadBusinessDocumentDto } from "./dto/upload-business-document.dto.js";
import { SaveBusinessDocumentDto } from "./dto/save-business-document.dto.js";
import { UploadServiceImageDto } from "./dto/upload-service-image.dto.js";
import { SaveServiceImageDto } from "./dto/save-service-image.dto.js";

@Injectable()
export class OnboardService {
  constructor(
    @InjectModel(Vendor.name)
    private readonly vendorModel: Model<VendorDocument>,
    @InjectModel(Business.name)
    private readonly businessModel: Model<BusinessDocument>,
    @InjectModel(Service.name)
    private readonly serviceModel: Model<ServiceDocument>,
    @InjectModel(Staff.name)
    private readonly staffModel: Model<StaffDocument>,
    @InjectModel(ServiceAvailability.name)
    private readonly serviceAvailabilityModel: Model<ServiceAvailabilityDocument>,
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

    // Validate availability configuration based on differentTimingsEachDay
    if (vendor.differentTimingsEachDay === true) {
      // Case A: differentTimingsEachDay = true - must have days array
      if (!vendor.days || vendor.days.length === 0) {
        throw new BadRequestException(
          "Vendor must have days configured when differentTimingsEachDay is true",
        );
      }
    } else {
      // Case B: differentTimingsEachDay = false - must have workingDays, startTime, endTime
      if (!vendor.workingDays || vendor.workingDays.length === 0) {
        throw new BadRequestException(
          "Vendor must have workingDays configured when differentTimingsEachDay is false",
        );
      }
      if (!vendor.startTime || !vendor.endTime) {
        throw new BadRequestException(
          "Vendor must have startTime and endTime configured when differentTimingsEachDay is false",
        );
      }
    }

    // Validate required fields for business creation
    if (
      !vendor.businessName ||
      !vendor.businessCategory ||
      !vendor.businessType ||
      !vendor.ownerName ||
      !vendor.address ||
      !vendor.city ||
      !vendor.pincode ||
      vendor.latitude === undefined ||
      vendor.longitude === undefined
    ) {
      throw new BadRequestException(
        "Vendor must have all required business information before approval",
      );
    }

    // Validate services exist
    if (!vendor.services || vendor.services.length === 0) {
      throw new BadRequestException(
        "Vendor must have at least one service before approval",
      );
    }

    // Update vendor approval flags
    vendor.isBusinessVerified = true;
    vendor.isBusinessImageApproved = true;
    vendor.isBusinessDocumentApproved = true;
    vendor.imageRejectMessage = undefined;
    vendor.documentRejectMessage = undefined;

    // Create business document
    const business = new this.businessModel({
      vendorId: vendor.userId,
      businessName: vendor.businessName,
      businessCategory: vendor.businessCategory,
      businessType: vendor.businessType,
      ownerName: vendor.ownerName,
      images: vendor.businessImages || [],
      documents: vendor.businessDocument ? [vendor.businessDocument] : [],
      contact: {
        mobileNo: vendor.mobileNo,
        alternatePhone: vendor.alternatePhoneNumber,
        email: vendor.businessEmail,
      },
      address: {
        address: vendor.address,
        city: vendor.city,
        landmark: vendor.landmark,
        pincode: vendor.pincode,
      },
      location: {
        type: "Point",
        coordinates: [vendor.longitude, vendor.latitude], // [longitude, latitude]
      },
      isActive: true,
      isDiscoverable: true,
    });

    const savedBusiness = await business.save();

    // Create service documents
    const serviceDocuments: ServiceDocument[] = [];
    for (const vendorService of vendor.services) {
      if (vendorService.isActive === false) continue; // Skip inactive services

      const service = new this.serviceModel({
        vendorId: vendor.userId,
        businessId: savedBusiness._id,
        serviceName: vendorService.serviceName,
        description: vendorService.description,
        durationInMinutes: vendorService.serviceDuration,
        bufferTimeInMinutes: vendorService.bufferTime || 0,
        price: vendorService.serviceCost,
        category: vendorService.category,
        gender: vendorService.gender,
        maxBookingsPerSlot: vendorService.maximumNo || 1,
        serviceImage: vendorService.serviceImage,
        location: {
          type: "Point",
          coordinates: [vendor.longitude, vendor.latitude], // [longitude, latitude]
        },
        isActive: vendorService.isActive ?? true,
        isDiscoverable: true,
      });

      const savedService = await service.save();
      serviceDocuments.push(savedService);
    }

    // Create staff documents (only if staff exists)
    if (vendor.staff && vendor.staff.length > 0) {
      const staffDocuments = vendor.staff.map((staffMember) => {
        return new this.staffModel({
          vendorId: vendor.userId,
          businessId: savedBusiness._id,
          name: staffMember.name,
          isActive: staffMember.isActive !== false,
        });
      });

      await this.staffModel.insertMany(staffDocuments);
    }

    // Create service_availability documents
    const availabilityDocuments: ServiceAvailabilityDocument[] = [];

    if (vendor.differentTimingsEachDay === true) {
      // Case A: differentTimingsEachDay = true
      // Create ONE document per service per entry in days[]
      // vendor.days is already validated above
      if (!vendor.days) {
        throw new BadRequestException("days array is required");
      }
      for (const serviceDoc of serviceDocuments) {
        for (const day of vendor.days) {
          const dayOfWeek = this.mapDayNameToNumber(day.day);

          // Format breaks from {break_start, break_end} to {start, end}
          const breaks = (day.breaks || []).map((breakItem) => ({
            start: breakItem.break_start,
            end: breakItem.break_end,
          }));

          const availability = new this.serviceAvailabilityModel({
            serviceId: serviceDoc._id,
            businessId: savedBusiness._id,
            vendorId: vendor.userId,
            dayOfWeek,
            startTime: day.start_time,
            endTime: day.end_time,
            breaks,
            isActive: true,
          });

          availabilityDocuments.push(availability);
        }
      }
    } else {
      // Case B: differentTimingsEachDay = false
      // Create ONE document per service per entry in workingDays[], all using the SAME time window
      // vendor.workingDays, vendor.startTime, vendor.endTime are already validated above
      if (!vendor.workingDays || !vendor.startTime || !vendor.endTime) {
        throw new BadRequestException(
          "workingDays, startTime, and endTime are required",
        );
      }
      // Extract to const for TypeScript type narrowing
      const workingDays = vendor.workingDays;
      const startTime = vendor.startTime;
      const endTime = vendor.endTime;

      // Format breaks from {break_start, break_end} to {start, end}
      const breaks =
        vendor.breaks?.map((breakItem) => ({
          start: breakItem.break_start,
          end: breakItem.break_end,
        })) || [];

      for (const serviceDoc of serviceDocuments) {
        for (const workingDay of workingDays) {
          const dayOfWeek = this.mapDayNameToNumber(workingDay);

          const availability = new this.serviceAvailabilityModel({
            serviceId: serviceDoc._id,
            businessId: savedBusiness._id,
            vendorId: vendor.userId,
            dayOfWeek,
            startTime,
            endTime,
            breaks,
            isActive: true,
          });

          availabilityDocuments.push(availability);
        }
      }
    }

    if (availabilityDocuments.length > 0) {
      await this.serviceAvailabilityModel.insertMany(availabilityDocuments);
    }

    // Save vendor
    const saved = await vendor.save();
    return this.sanitizeVendor(saved);
  }

  /**
   * Maps day name (full English name) to dayOfWeek number
   * Sunday = 0, Monday = 1, ..., Saturday = 6
   */
  private mapDayNameToNumber(dayName: string): number {
    const dayMap: Record<string, number> = {
      Sunday: 0,
      Monday: 1,
      Tuesday: 2,
      Wednesday: 3,
      Thursday: 4,
      Friday: 5,
      Saturday: 6,
    };

    const normalizedDay = dayName.trim();
    const dayNumber = dayMap[normalizedDay];

    if (dayNumber === undefined) {
      throw new BadRequestException(
        `Invalid day name: ${dayName}. Must be a full English day name (Sunday-Saturday)`,
      );
    }

    return dayNumber;
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

  async getVerifiedVendorView(userId: string) {
    // Find business by vendorId
    const business = await this.businessModel
      .findOne({ vendorId: userId })
      .lean()
      .exec();

    if (!business) {
      throw new NotFoundException(
        `Business for vendor with userId ${userId} not found. Vendor may not be approved yet.`,
      );
    }

    // Find all services for this business
    const services = await this.serviceModel
      .find({ businessId: business._id, isActive: true })
      .lean()
      .exec();

    // Find all staff for this business
    const staff = await this.staffModel
      .find({ businessId: business._id })
      .lean()
      .exec();

    // Get service IDs
    const serviceIds = services.map((s) => s._id);

    // Find all service availability for these services
    const serviceAvailabilities = await this.serviceAvailabilityModel
      .find({
        serviceId: { $in: serviceIds },
        isActive: true,
      })
      .lean()
      .exec();

    // Map services with their availability
    const servicesWithAvailability = services.map((service) => {
      const serviceAvailability = serviceAvailabilities
        .filter((sa) => sa.serviceId.toString() === service._id.toString())
        .map((sa) => ({
          dayOfWeek: sa.dayOfWeek,
          startTime: sa.startTime,
          endTime: sa.endTime,
          breaks: sa.breaks || [],
        }));

      return {
        serviceId: this.toStringId(service._id),
        serviceName: service.serviceName,
        serviceDuration: service.durationInMinutes,
        serviceCost: service.price,
        gender: service.gender,
        description: service.description,
        category: service.category,
        bufferTime: service.bufferTimeInMinutes,
        assignedStaff: [], // Not stored in production collections
        maximumNo: service.maxBookingsPerSlot,
        serviceImage: service.serviceImage,
        isActive: service.isActive,
        availability: serviceAvailability,
      };
    });

    // Format staff
    const formattedStaff = staff.map((s) => ({
      name: s.name,
      isActive: s.isActive,
    }));

    // Build response similar to vendor format
    // business is a lean document (plain object)
    const businessPlain = business as unknown as {
      _id: unknown;
      vendorId: string;
      businessName: string;
      businessCategory: string;
      businessType: string;
      ownerName: string;
      address?: {
        address?: string;
        city?: string;
        landmark?: string;
        pincode?: string;
      };
      location?: { coordinates?: [number, number] };
      contact?: { mobileNo?: string; alternatePhone?: string; email?: string };
      images?: string[];
      documents?: string[];
      isActive: boolean;
      isDiscoverable: boolean;
      createdAt?: Date;
      updatedAt?: Date;
    };

    return {
      _id: this.toStringId(businessPlain._id),
      userId: businessPlain.vendorId,
      businessName: businessPlain.businessName,
      businessCategory: businessPlain.businessCategory,
      businessType: businessPlain.businessType,
      ownerName: businessPlain.ownerName,
      address: businessPlain.address?.address,
      city: businessPlain.address?.city,
      landmark: businessPlain.address?.landmark,
      pincode: businessPlain.address?.pincode,
      latitude: businessPlain.location?.coordinates?.[1], // latitude is second in [longitude, latitude]
      longitude: businessPlain.location?.coordinates?.[0], // longitude is first
      mobileNo: businessPlain.contact?.mobileNo,
      alternatePhoneNumber: businessPlain.contact?.alternatePhone,
      businessEmail: businessPlain.contact?.email,
      businessImages: businessPlain.images || [],
      businessDocument: businessPlain.documents?.[0] || null,
      images: businessPlain.images || [],
      documents: businessPlain.documents || [],
      contact: businessPlain.contact,
      location: businessPlain.location,
      isActive: businessPlain.isActive,
      isDiscoverable: businessPlain.isDiscoverable,
      services: servicesWithAvailability,
      staff: formattedStaff,
      createdAt: businessPlain.createdAt,
      updatedAt: businessPlain.updatedAt,
    };
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

  // ==================== iOS-SAFE UPLOAD METHODS (UPLOAD ONLY, NO DB) ====================

  /**
   * STEP 1: Upload business images to R2 only
   * Returns small JSON with image URLs only
   * No database operations
   * iOS-safe: POST method, small response, no exceptions after upload starts
   */
  async uploadBusinessImagesOnly(
    userId: string,
    uploadDto: UploadBusinessImagesDto,
    files: { businessImages?: Array<{ buffer: Buffer; mimetype: string }> },
  ): Promise<{ imageUrls: string[] }> {
    // Validate userId before upload starts
    if (uploadDto.userId !== userId) {
      throw new BadRequestException(
        "userId in request body does not match userId in route parameter",
      );
    }

    const images = files.businessImages ?? [];

    if (!Array.isArray(images) || images.length !== 2) {
      throw new BadRequestException(
        "businessImages must contain exactly 2 files",
      );
    }

    // Validate files before upload starts
    for (const file of images) {
      if (!file.buffer || !file.mimetype) {
        throw new BadRequestException("Invalid file upload");
      }
    }

    const uploadedKeys: string[] = [];
    const uploadedUrls: string[] = [];

    try {
      // Upload all files to R2
      for (const [index, file] of images.entries()) {
        const key = `vendors/${userId}/business-${randomUUID()}-${index}`;
        await this.r2Service.uploadObject(key, file.buffer, file.mimetype);
        uploadedKeys.push(key);
        uploadedUrls.push(this.r2Service.getPublicUrl(key));
      }

      // Return small response with URLs only
      return { imageUrls: uploadedUrls };
    } catch (error) {
      // Cleanup uploaded files on error
      await Promise.all(
        uploadedKeys.map((key) =>
          this.r2Service.deleteObject(key).catch(() => undefined),
        ),
      );

      // Re-throw as BadRequestException (not after stream write)
      throw new BadRequestException(
        `Failed to upload images: ${error instanceof Error ? error.message : "Unknown error"}`,
      );
    }
  }

  /**
   * STEP 2: Save business image URLs to MongoDB
   * Pure JSON request, no file streams
   *
   * IMPORTANT: Deletes old images from R2 BEFORE saving new URLs
   * This prevents orphaned files in cloud storage
   */
  async saveBusinessImagesMetadata(
    userId: string,
    saveDto: SaveBusinessImagesDto,
  ): Promise<{ success: boolean; message: string }> {
    if (saveDto.userId !== userId) {
      throw new BadRequestException(
        "userId in request body does not match userId in route parameter",
      );
    }

    if (!Array.isArray(saveDto.imageUrls) || saveDto.imageUrls.length !== 2) {
      throw new BadRequestException("Must provide exactly 2 image URLs");
    }

    const vendor = await this.vendorModel.findOne({ userId }).exec();

    if (!vendor) {
      throw new NotFoundException(`Vendor with userId ${userId} not found`);
    }

    // Delete old images from R2
    if (Array.isArray(vendor.businessImages)) {
      for (const url of vendor.businessImages) {
        const key = this.r2Service.getKeyFromUrl(url);
        if (key) {
          await this.r2Service.deleteObject(key).catch(() => undefined);
        }
      }
    }

    // Save new URLs to MongoDB
    vendor.businessImages = saveDto.imageUrls;
    await vendor.save();

    return {
      success: true,
      message: "Business images saved successfully",
    };
  }

  /**
   * STEP 1: Upload business document to R2 only
   * Returns small JSON with document URL only
   * No database operations
   */
  async uploadBusinessDocumentOnly(
    userId: string,
    uploadDto: UploadBusinessDocumentDto,
    files: { businessDocument?: Array<{ buffer: Buffer; mimetype: string }> },
  ): Promise<{ documentUrl: string }> {
    if (uploadDto.userId !== userId) {
      throw new BadRequestException(
        "userId in request body does not match userId in route parameter",
      );
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

    let uploadedKey: string | undefined = undefined;

    try {
      // Upload to R2
      uploadedKey = `vendors/${userId}/business-document-${randomUUID()}`;
      await this.r2Service.uploadObject(
        uploadedKey,
        file.buffer,
        file.mimetype,
      );
      const documentUrl = this.r2Service.getPublicUrl(uploadedKey);

      // Return small response with URL only
      return { documentUrl };
    } catch (error) {
      // Cleanup on error
      if (uploadedKey) {
        await this.r2Service.deleteObject(uploadedKey).catch(() => undefined);
      }

      throw new BadRequestException(
        `Failed to upload document: ${error instanceof Error ? error.message : "Unknown error"}`,
      );
    }
  }

  /**
   * STEP 2: Save business document URL to MongoDB
   * Pure JSON request, no file streams
   *
   * IMPORTANT: Deletes old document from R2 BEFORE saving new URL
   * This prevents orphaned files in cloud storage
   */
  async saveBusinessDocumentMetadata(
    userId: string,
    saveDto: SaveBusinessDocumentDto,
  ): Promise<{ success: boolean; message: string }> {
    if (saveDto.userId !== userId) {
      throw new BadRequestException(
        "userId in request body does not match userId in route parameter",
      );
    }

    const vendor = await this.vendorModel.findOne({ userId }).exec();

    if (!vendor) {
      throw new NotFoundException(`Vendor with userId ${userId} not found`);
    }

    // Delete old document from R2
    if (vendor.businessDocument) {
      const oldKey = this.r2Service.getKeyFromUrl(vendor.businessDocument);
      if (oldKey) {
        await this.r2Service.deleteObject(oldKey).catch(() => undefined);
      }
    }

    // Save new URL to MongoDB
    vendor.businessDocument = saveDto.documentUrl;
    await vendor.save();

    return {
      success: true,
      message: "Business document saved successfully",
    };
  }

  /**
   * STEP 1: Upload service image to R2 only
   * Returns small JSON with image URL only
   * No database operations
   */
  async uploadServiceImageOnly(
    userId: string,
    uploadDto: UploadServiceImageDto,
    files: { serviceImage?: Array<{ buffer: Buffer; mimetype: string }> },
  ): Promise<{ imageUrl: string }> {
    if (uploadDto.userId !== userId) {
      throw new BadRequestException(
        "userId in request body does not match userId in route parameter",
      );
    }

    const serviceImageFile = files?.serviceImage?.[0];
    if (!serviceImageFile?.buffer || !serviceImageFile?.mimetype) {
      throw new BadRequestException("serviceImage file is required");
    }

    // Verify service exists before upload (lightweight check)
    const vendor = await this.vendorModel.findOne({ userId }).lean().exec();
    if (!vendor) {
      throw new NotFoundException(`Vendor with userId ${userId} not found`);
    }

    const existingServices = vendor.services ?? [];
    const serviceExists = existingServices.some(
      (svc) =>
        (svc as { serviceId?: string }).serviceId === uploadDto.serviceId,
    );

    if (!serviceExists) {
      throw new NotFoundException(
        `Service with serviceId "${uploadDto.serviceId}" not found`,
      );
    }

    let uploadedKey: string | undefined = undefined;

    try {
      // Upload to R2
      uploadedKey = `vendors/${userId}/service-${randomUUID()}`;
      await this.r2Service.uploadObject(
        uploadedKey,
        serviceImageFile.buffer,
        serviceImageFile.mimetype,
      );
      const imageUrl = this.r2Service.getPublicUrl(uploadedKey);

      // Return small response with URL only
      return { imageUrl };
    } catch (error) {
      // Cleanup on error
      if (uploadedKey) {
        await this.r2Service.deleteObject(uploadedKey).catch(() => undefined);
      }

      throw new BadRequestException(
        `Failed to upload service image: ${error instanceof Error ? error.message : "Unknown error"}`,
      );
    }
  }

  /**
   * STEP 2: Save service image URL to MongoDB
   * Pure JSON request, no file streams
   *
   * IMPORTANT: Deletes old service image from R2 BEFORE saving new URL
   * This prevents orphaned files in cloud storage
   */
  async saveServiceImageMetadata(
    userId: string,
    saveDto: SaveServiceImageDto,
  ): Promise<{ success: boolean; message: string }> {
    if (saveDto.userId !== userId) {
      throw new BadRequestException(
        "userId in request body does not match userId in route parameter",
      );
    }

    const vendor = await this.vendorModel.findOne({ userId }).exec();

    if (!vendor) {
      throw new NotFoundException(`Vendor with userId ${userId} not found`);
    }

    const existingServices = vendor.services ?? [];
    const serviceIndex = existingServices.findIndex(
      (svc) => (svc as { serviceId?: string }).serviceId === saveDto.serviceId,
    );

    if (serviceIndex === -1) {
      throw new NotFoundException(
        `Service with serviceId "${saveDto.serviceId}" not found`,
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

    // Delete old image from R2
    if (existingService.serviceImage) {
      const oldKey = this.r2Service.getKeyFromUrl(existingService.serviceImage);
      if (oldKey) {
        await this.r2Service.deleteObject(oldKey).catch(() => undefined);
      }
    }

    // Update service with new image URL
    const updatedService = {
      serviceId: existingService.serviceId,
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
      serviceImage: saveDto.imageUrl,
    };

    existingServices[serviceIndex] = updatedService;
    vendor.services = existingServices;
    await vendor.save();

    return {
      success: true,
      message: "Service image saved successfully",
    };
  }
}
