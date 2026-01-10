import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Query,
  Res,
  UploadedFiles,
  UseInterceptors,
} from "@nestjs/common";
import { FileFieldsInterceptor } from "@nestjs/platform-express";
import type { Response } from "express";
import { OnboardService } from "./onboard.service.js";
import {
  AddVendorServiceDto,
  AddVendorServiceJsonDto,
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
import { ProdUploadServiceImageDto } from "./dto/prod-upload-service-image.dto.js";
import { ProdAddServiceRequestDto } from "./dto/prod-add-service-request.dto.js";

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

  /**
   * STEP 1: Upload business images to R2 only
   * POST method (iOS-safe)
   * Returns small JSON: { imageUrls: string[] }
   * No database operations
   */
  @Post(":userId/upload-business-images")
  @HttpCode(HttpStatus.OK)
  @UseInterceptors(
    FileFieldsInterceptor([{ name: "businessImages", maxCount: 2 }]),
  )
  async uploadBusinessImagesOnly(
    @Param("userId") userId: string,
    @UploadedFiles()
    files: {
      businessImages?: Array<{ buffer: Buffer; mimetype: string }>;
    },
    @Body() payload: UploadBusinessImagesDto,
    @Res() res: Response,
  ) {
    const result = await this.onboardService.uploadBusinessImagesOnly(
      userId,
      payload,
      files,
    );
    res.json({ success: true, data: result });
    res.end();
  }

  /**
   * STEP 2: Save business image URLs to MongoDB
   * PATCH method (pure JSON, no file streams)
   */
  @Patch(":userId/save-business-images")
  async saveBusinessImagesMetadata(
    @Param("userId") userId: string,
    @Body() payload: SaveBusinessImagesDto,
    @Res() res: Response,
  ) {
    const result = await this.onboardService.saveBusinessImagesMetadata(
      userId,
      payload,
    );
    res.json({ success: true, data: result });
    res.end();
  }

  /**
   * STEP 1: Upload business document to R2 only
   * POST method (iOS-safe)
   * Returns small JSON: { documentUrl: string }
   * No database operations
   */
  @Post(":userId/upload-business-document")
  @HttpCode(HttpStatus.OK)
  @UseInterceptors(
    FileFieldsInterceptor([{ name: "businessDocument", maxCount: 1 }]),
  )
  async uploadBusinessDocumentOnly(
    @Param("userId") userId: string,
    @UploadedFiles()
    files: {
      businessDocument?: Array<{ buffer: Buffer; mimetype: string }>;
    },
    @Body() payload: UploadBusinessDocumentDto,
    @Res() res: Response,
  ) {
    const result = await this.onboardService.uploadBusinessDocumentOnly(
      userId,
      payload,
      files,
    );
    res.json({ success: true, data: result });
    res.end();
  }

  /**
   * STEP 2: Save business document URL to MongoDB
   * PATCH method (pure JSON, no file streams)
   */
  @Patch(":userId/save-business-document")
  async saveBusinessDocumentMetadata(
    @Param("userId") userId: string,
    @Body() payload: SaveBusinessDocumentDto,
    @Res() res: Response,
  ) {
    const result = await this.onboardService.saveBusinessDocumentMetadata(
      userId,
      payload,
    );
    res.json({ success: true, data: result });
    res.end();
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

  @Patch(":userId/reject-services")
  async rejectVendorServices(
    @Param("userId") userId: string,
    @Body() payload: RejectVendorServicesDto,
  ) {
    return this.onboardService.rejectVendorServices(userId, payload);
  }

  @Patch(":userId/reject-bank-details")
  async rejectVendorBankDetails(
    @Param("userId") userId: string,
    @Body() payload: RejectVendorBankDetailsDto,
  ) {
    return await this.onboardService.rejectVendorBankDetails(userId, payload);
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

  /**
   * STEP 1: Upload service image to R2 only
   * POST method (iOS-safe)
   * Returns small JSON: { imageUrl: string }
   * No database operations
   */
  @Post(":userId/upload-service-image")
  @HttpCode(HttpStatus.OK)
  @UseInterceptors(
    FileFieldsInterceptor([{ name: "serviceImage", maxCount: 1 }]),
  )
  async uploadServiceImageOnly(
    @Param("userId") userId: string,
    @UploadedFiles()
    files: {
      serviceImage?: Array<{ buffer: Buffer; mimetype: string }>;
    },
    @Body() payload: UploadServiceImageDto,
    @Res() res: Response,
  ) {
    const result = await this.onboardService.uploadServiceImageOnly(
      userId,
      payload,
      files,
    );
    res.json({ success: true, data: result });
    res.end();
  }

  /**
   * STEP 2: Save service image URL to MongoDB
   * PATCH method (pure JSON, no file streams)
   */
  @Patch(":userId/save-service-image")
  async saveServiceImageMetadata(
    @Param("userId") userId: string,
    @Body() payload: SaveServiceImageDto,
    @Res() res: Response,
  ) {
    const result = await this.onboardService.saveServiceImageMetadata(
      userId,
      payload,
    );
    res.json({ success: true, data: result });
    res.end();
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

  /**
   * PRODUCTION APIs - Service Approval Flow
   */

  /**
   * STEP 1: Upload service image to R2 (for production service request)
   * POST method (multipart/form-data)
   */
  @Post(":businessId/prod-upload-service-image")
  @HttpCode(HttpStatus.OK)
  @UseInterceptors(
    FileFieldsInterceptor([{ name: "serviceImage", maxCount: 1 }]),
  )
  async prodUploadServiceImage(
    @Param("businessId") businessId: string,
    @UploadedFiles()
    files: {
      serviceImage?: Array<{ buffer: Buffer; mimetype: string }>;
    },
    @Body() payload: ProdUploadServiceImageDto,
    @Res() res: Response,
  ) {
    const result = await this.onboardService.prodUploadServiceImage(
      businessId,
      payload,
      files,
    );
    res.json({ success: true, data: result });
    res.end();
  }

  /**
   * STEP 2: Save service request metadata to services_approval
   * PATCH method (pure JSON, no file streams)
   */
  @Patch(":businessId/prod-save-service-request")
  async prodSaveServiceRequest(
    @Param("businessId") businessId: string,
    @Body() payload: ProdAddServiceRequestDto,
    @Res() res: Response,
  ) {
    const result = await this.onboardService.prodSaveServiceRequest(
      businessId,
      payload,
    );
    res.json({ success: true, data: result });
    res.end();
  }

  /**
   * Approve service request and create service + availability
   * POST method (uses MongoDB transaction)
   */
  @Post(":serviceApprovalId/prod-approve-service")
  async prodApproveService(
    @Param("serviceApprovalId") serviceApprovalId: string,
    @Res() res: Response,
  ) {
    const result =
      await this.onboardService.prodApproveService(serviceApprovalId);
    res.json({ success: true, data: result });
    res.end();
  }

  /**
   * Reject service request and delete image from R2
   * POST method
   */
  @Post(":serviceApprovalId/prod-reject-service")
  async prodRejectService(
    @Param("serviceApprovalId") serviceApprovalId: string,
    @Res() res: Response,
  ) {
    const result =
      await this.onboardService.prodRejectService(serviceApprovalId);
    res.json({ success: true, data: result });
    res.end();
  }

  /**
   * Get list of service approvals with optional filtering
   * GET method with query parameters
   */
  @Get("service-approvals")
  async getServiceApprovals(
    @Res() res: Response,
    @Query("status") status?: string,
    @Query("vendorId") vendorId?: string,
    @Query("businessId") businessId?: string,
  ) {
    const result = await this.onboardService.getServiceApprovals({
      status,
      vendorId,
      businessId,
    });
    res.json({ success: true, data: result });
    res.end();
  }
}
