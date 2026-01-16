import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Query,
  Res,
  UploadedFiles,
  UseInterceptors,
} from "@nestjs/common";
import { FileFieldsInterceptor } from "@nestjs/platform-express";
import type { Response } from "express";
import { PromotionsService } from "./promotions.service.js";
import { UploadPromotionImagesDto } from "./dto/upload-promotion-images.dto.js";
import { CreateGlobalPromotionDto } from "./dto/create-global-promotion.dto.js";

@Controller("admin/promotions")
export class AdminPromotionsController {
  constructor(private readonly promotionsService: PromotionsService) {}

  /**
   * Admin fetches all promotion requests
   * GET /api/admin/promotions/requests?status=pending
   */
  @Get("requests")
  @HttpCode(HttpStatus.OK)
  async getAllPromotionRequests(
    @Res() res: Response,
    @Query("status") status?: string,
  ) {
    const result = await this.promotionsService.getAllPromotionRequests(status);
    res.json({ success: true, data: result });
    res.end();
  }

  /**
   * Step 2: Admin uploads promotion images
   * POST /api/admin/promotions/:requestId/upload-images
   */
  @Post(":requestId/upload-images")
  @HttpCode(HttpStatus.OK)
  @UseInterceptors(
    FileFieldsInterceptor([{ name: "promotionImages", maxCount: 4 }]),
  )
  async uploadPromotionImages(
    @Param("requestId") requestId: string,
    @UploadedFiles()
    files: {
      promotionImages?: Array<{ buffer: Buffer; mimetype: string }>;
    },
    @Body() payload: UploadPromotionImagesDto,
    @Res() res: Response,
  ) {
    const result = await this.promotionsService.uploadPromotionImages(
      requestId,
      payload,
      files,
    );
    res.json({ success: true, data: result });
    res.end();
  }

  /**
   * Step 6: Admin approves promotion
   * POST /api/admin/promotions/:requestId/approve
   */
  @Post(":requestId/approve")
  @HttpCode(HttpStatus.OK)
  async approvePromotion(
    @Param("requestId") requestId: string,
    @Res() res: Response,
  ) {
    const result = await this.promotionsService.approvePromotion(requestId);
    res.json({ success: true, data: result });
    res.end();
  }

  /**
   * Admin creates a global promotion
   * POST /api/admin/promotions/global-promote
   */
  @Post("global-promote")
  @HttpCode(HttpStatus.CREATED)
  @UseInterceptors(
    FileFieldsInterceptor([{ name: "promotionImage", maxCount: 1 }]),
  )
  async createGlobalPromotion(
    @UploadedFiles()
    files: {
      promotionImage?: Array<{ buffer: Buffer; mimetype: string }>;
    },
    @Body() payload: CreateGlobalPromotionDto,
    @Res() res: Response,
  ) {
    const result = await this.promotionsService.createGlobalPromotion(
      payload,
      files,
    );
    res.json({ success: true, data: result });
    res.end();
  }

  /**
   * Admin deletes a global promotion
   * DELETE /api/admin/promotions/global-promote/:promotionId
   */
  @Delete("global-promote/:promotionId")
  @HttpCode(HttpStatus.OK)
  async deleteGlobalPromotion(
    @Param("promotionId") promotionId: string,
    @Res() res: Response,
  ) {
    const result =
      await this.promotionsService.deleteGlobalPromotion(promotionId);
    res.json({ success: true, data: result });
    res.end();
  }
}
