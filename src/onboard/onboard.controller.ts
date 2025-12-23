import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  UploadedFiles,
  UseInterceptors,
} from "@nestjs/common";
import { FileFieldsInterceptor } from "@nestjs/platform-express";
import { OnboardService } from "./onboard.service.js";
import {
  AddVendorServiceDto,
  AddVendorServiceJsonDto,
} from "./dto/add-vendor-service.dto.js";
import { AddServiceImageDto } from "./dto/add-service-image.dto.js";
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

@Controller("vendor")
export class OnboardController {
  constructor(private readonly onboardService: OnboardService) {}

  @Patch(":userId")
  async updateVendor(
    @Param("userId") userId: string,
    @Body() updateVendorDto: UpdateVendorDto,
  ) {
    return this.onboardService.updateVendor(userId, updateVendorDto);
  }

  @Patch(":userId/business-images")
  @UseInterceptors(
    FileFieldsInterceptor([{ name: "businessImages", maxCount: 2 }]),
  )
  async updateVendorImages(
    @Param("userId") userId: string,
    @UploadedFiles()
    files: {
      businessImages?: Array<{ buffer: Buffer; mimetype: string }>;
    },
    @Body() payload: UpdateVendorImagesDto,
  ) {
    return this.onboardService.updateVendorImages(userId, payload, files);
  }

  @Patch(":userId/business-document")
  @UseInterceptors(
    FileFieldsInterceptor([{ name: "businessDocument", maxCount: 1 }]),
  )
  async updateVendorDocument(
    @Param("userId") userId: string,
    @UploadedFiles()
    files: {
      businessDocument?: Array<{ buffer: Buffer; mimetype: string }>;
    },
    @Body() payload: UpdateVendorDocumentDto,
  ) {
    return this.onboardService.updateVendorDocument(userId, payload, files);
  }

  @Patch(":userId/reject-images")
  async rejectVendorImages(
    @Param("userId") userId: string,
    @Body() payload: RejectVendorImagesDto,
  ) {
    return this.onboardService.rejectVendorImages(userId, payload);
  }

  @Patch(":userId/reject-document")
  async rejectVendorDocument(
    @Param("userId") userId: string,
    @Body() payload: RejectVendorDocumentDto,
  ) {
    return this.onboardService.rejectVendorDocument(userId, payload);
  }

  @Patch(":userId/add-service-json")
  async addVendorServiceJson(
    @Param("userId") userId: string,
    @Body() payload: AddVendorServiceJsonDto,
  ) {
    // Convert to AddVendorServiceDto format for service method
    const addServiceDto: AddVendorServiceDto = {
      userId,
      service: payload.service,
    };
    return await this.onboardService.addVendorService(
      userId,
      addServiceDto,
      undefined,
    );
  }

  @Patch(":userId/add-service")
  @UseInterceptors(
    FileFieldsInterceptor([{ name: "serviceImage", maxCount: 1 }]),
  )
  async addServiceImage(
    @Param("userId") userId: string,
    @UploadedFiles()
    files: {
      serviceImage?: Array<{ buffer: Buffer; mimetype: string }>;
    },
    @Body() payload: AddServiceImageDto,
  ) {
    return await this.onboardService.addServiceImage(
      userId,
      payload.serviceId,
      files,
    );
  }

  @Patch(":userId/update-service-json")
  async updateVendorServiceJson(
    @Param("userId") userId: string,
    @Body() payload: UpdateVendorServiceDto,
  ) {
    return await this.onboardService.updateVendorService(
      userId,
      payload,
      undefined, // No files for JSON endpoint
    );
  }

  @Patch(":userId/update-service")
  @UseInterceptors(
    FileFieldsInterceptor([{ name: "serviceImage", maxCount: 1 }]),
  )
  async updateServiceImage(
    @Param("userId") userId: string,
    @UploadedFiles()
    files: {
      serviceImage?: Array<{ buffer: Buffer; mimetype: string }>;
    },
    @Body() payload: AddServiceImageDto,
  ) {
    return await this.onboardService.addServiceImage(
      userId,
      payload.serviceId,
      files,
    );
  }

  @Delete(":userId/service")
  async deleteVendorService(
    @Param("userId") userId: string,
    @Body() payload: DeleteVendorServiceDto,
  ) {
    return this.onboardService.deleteVendorService(userId, payload);
  }

  @Patch(":userId/add-staff")
  async addVendorStaff(
    @Param("userId") userId: string,
    @Body() payload: AddVendorStaffDto,
  ) {
    return this.onboardService.addVendorStaff(userId, payload);
  }

  @Patch(":userId/update-staff")
  async updateVendorStaff(
    @Param("userId") userId: string,
    @Body() payload: UpdateVendorStaffDto,
  ) {
    return this.onboardService.updateVendorStaff(userId, payload);
  }

  @Get(":userId/staff")
  async getVendorStaff(@Param("userId") userId: string) {
    return await this.onboardService.getVendorStaff(userId);
  }

  @Delete(":userId/staff")
  async deleteVendorStaff(
    @Param("userId") userId: string,
    @Body() payload: DeleteVendorStaffDto,
  ) {
    return await this.onboardService.deleteVendorStaff(userId, payload);
  }

  @Patch(":userId/approve-vendor-production")
  async approveVendorProduction(
    @Param("userId") userId: string,
    @Body() payload: ApproveVendorProductionDto,
  ) {
    return this.onboardService.approveVendorProduction(userId, payload);
  }

  @Patch(":userId/add-bank-details")
  async addVendorBankDetails(
    @Param("userId") userId: string,
    @Body() payload: AddVendorBankDetailsDto,
  ) {
    return this.onboardService.addVendorBankDetails(userId, payload);
  }

  @Patch(":userId/update-bank-details")
  async updateVendorBankDetails(
    @Param("userId") userId: string,
    @Body() payload: UpdateVendorBankDetailsDto,
  ) {
    return this.onboardService.updateVendorBankDetails(userId, payload);
  }
}
