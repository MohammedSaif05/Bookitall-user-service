import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Query,
  Res,
} from "@nestjs/common";
import type { Response } from "express";
import { PromotionsService } from "./promotions.service.js";
import { CreatePromotionRequestDto } from "./dto/create-promotion-request.dto.js";

@Controller("vendor/promotions")
export class VendorPromotionsController {
  constructor(private readonly promotionsService: PromotionsService) {}

  /**
   * Step 1: Vendor submits promotion request
   * POST /api/vendor/promotions/request
   */
  @Post("request")
  @HttpCode(HttpStatus.CREATED)
  async createPromotionRequest(
    @Body() createDto: CreatePromotionRequestDto,
    @Res() res: Response,
  ) {
    // Note: In a real app, vendorId should come from authentication token
    const result = await this.promotionsService.createPromotionRequest(
      createDto.vendorId,
      createDto,
    );
    res.json({ success: true, data: result });
    res.end();
  }

  /**
   * Step 3: Vendor fetches their promotion requests
   * GET /api/vendor/promotions/requests?vendorId=xxx
   */
  @Get("requests")
  @HttpCode(HttpStatus.OK)
  async getVendorPromotionRequests(
    @Query("vendorId") vendorId: string,
    @Res() res: Response,
  ) {
    // Note: In a real app, vendorId should come from authentication token
    if (!vendorId) {
      return res.status(HttpStatus.BAD_REQUEST).json({
        success: false,
        statusCode: HttpStatus.BAD_REQUEST,
        message: "vendorId is required",
      });
    }

    const result =
      await this.promotionsService.getVendorPromotionRequests(vendorId);
    res.json({ success: true, data: result });
    res.end();
  }

  /**
   * Step 4: Vendor fetches promotional images for a request
   * GET /api/vendor/promotions/:requestId/assets?vendorId=xxx
   */
  @Get(":requestId/assets")
  @HttpCode(HttpStatus.OK)
  async getPromotionAssets(
    @Param("requestId") requestId: string,
    @Query("vendorId") vendorId: string,
    @Res() res: Response,
  ) {
    // Note: In a real app, vendorId should come from authentication token
    if (!vendorId) {
      return res.status(HttpStatus.BAD_REQUEST).json({
        success: false,
        statusCode: HttpStatus.BAD_REQUEST,
        message: "vendorId is required",
      });
    }

    const result = await this.promotionsService.getPromotionAssets(
      vendorId,
      requestId,
    );
    res.json({ success: true, data: result });
    res.end();
  }

  /**
   * Step 5: Vendor selects ONE image
   * POST /api/vendor/promotions/assets/:assetId/select
   */
  @Post("assets/:assetId/select")
  @HttpCode(HttpStatus.OK)
  async selectPromotionAsset(
    @Param("assetId") assetId: string,
    @Body("vendorId") vendorId: string,
    @Res() res: Response,
  ) {
    // Note: In a real app, vendorId should come from authentication token
    if (!vendorId) {
      return res.status(HttpStatus.BAD_REQUEST).json({
        success: false,
        statusCode: HttpStatus.BAD_REQUEST,
        message: "vendorId is required",
      });
    }

    const result = await this.promotionsService.selectPromotionAsset(
      vendorId,
      assetId,
    );
    res.json({ success: true, data: result });
    res.end();
  }
}
