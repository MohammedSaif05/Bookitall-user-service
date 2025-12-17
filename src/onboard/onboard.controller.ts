import {
  Body,
  Controller,
  Param,
  Patch,
  UploadedFiles,
  UseInterceptors,
} from "@nestjs/common";
import { FileFieldsInterceptor } from "@nestjs/platform-express";
import { OnboardService } from "./onboard.service.js";
import { AddVendorServiceDto } from "./dto/add-vendor-service.dto.js";
import { AddVendorStaffDto } from "./dto/add-vendor-staff.dto.js";
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

  @Patch(":userId/add-service")
  async addVendorService(
    @Param("userId") userId: string,
    @Body() payload: AddVendorServiceDto,
  ) {
    return this.onboardService.addVendorService(userId, payload);
  }

  @Patch(":userId/add-staff")
  async addVendorStaff(
    @Param("userId") userId: string,
    @Body() payload: AddVendorStaffDto,
  ) {
    return this.onboardService.addVendorStaff(userId, payload);
  }

  @Patch(":userId/approve-vendor-production")
  async approveVendorProduction(
    @Param("userId") userId: string,
    @Body() payload: ApproveVendorProductionDto,
  ) {
    return this.onboardService.approveVendorProduction(userId, payload);
  }
}
