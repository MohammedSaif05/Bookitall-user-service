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
import { UpdateVendorDto } from "./dto/update-vendor.dto.js";
import { UpdateVendorDocumentDto } from "./dto/update-vendor-document.dto.js";
import { UpdateVendorImagesDto } from "./dto/update-vendor-images.dto.js";

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
  @UseInterceptors(FileFieldsInterceptor([{ name: "businessDocument", maxCount: 1 }]))
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
}
