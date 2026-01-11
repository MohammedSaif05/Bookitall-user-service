import {
  Body,
  Controller,
  Delete,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Put,
  Res,
  UploadedFiles,
  UseInterceptors,
} from "@nestjs/common";
import { FileFieldsInterceptor } from "@nestjs/platform-express";
import type { Response } from "express";
import { OnboardService } from "./onboard.service.js";
import { ProdAddCategoryDto } from "./dto/prod-add-category.dto.js";
import { ProdUpdateCategoryDto } from "./dto/prod-update-category.dto.js";

@Controller("admin/categories")
export class CategoriesController {
  constructor(private readonly onboardService: OnboardService) {}

  /**
   * STEP 1: Upload category image to R2
   * POST method (multipart/form-data)
   */
  @Post("upload-category-image")
  @HttpCode(HttpStatus.OK)
  @UseInterceptors(FileFieldsInterceptor([{ name: "image", maxCount: 1 }]))
  async prodUploadCategoryImage(
    @UploadedFiles()
    files: {
      image?: Array<{ buffer: Buffer; mimetype: string }>;
    },
    @Res() res: Response,
  ) {
    const result = await this.onboardService.prodUploadCategoryImage(files);
    res.json({ success: true, data: result });
    res.end();
  }

  /**
   * STEP 2: Save category metadata
   * POST method (pure JSON, no file streams)
   */
  @Post("add-prod-category")
  async prodAddCategory(
    @Body() payload: ProdAddCategoryDto,
    @Res() res: Response,
  ) {
    const result = await this.onboardService.prodAddCategory(payload);
    res.json({ success: true, data: result });
    res.end();
  }

  /**
   * Update category (rename, change image, change order, activate/deactivate)
   * PUT method
   */
  @Put(":categoryId")
  async prodUpdateCategory(
    @Param("categoryId") categoryId: string,
    @Body() payload: ProdUpdateCategoryDto,
    @Res() res: Response,
  ) {
    const result = await this.onboardService.prodUpdateCategory(
      categoryId,
      payload,
    );
    res.json({ success: true, data: result });
    res.end();
  }

  /**
   * Soft delete category (set isActive = false)
   * DELETE method
   */
  @Delete(":categoryId")
  async prodDeleteCategory(
    @Param("categoryId") categoryId: string,
    @Res() res: Response,
  ) {
    const result = await this.onboardService.prodDeleteCategory(categoryId);
    res.json({ success: true, data: result });
    res.end();
  }
}
