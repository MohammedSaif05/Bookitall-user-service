import {
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Query,
  Res,
} from "@nestjs/common";
import type { Response } from "express";
import { PromotionsService } from "./promotions.service.js";

@Controller("promotions")
export class PromotionsController {
  constructor(private readonly promotionsService: PromotionsService) {}

  /**
   * Step 7: User fetches active promotions
   * GET /api/promotions?isActive=true
   */
  @Get()
  @HttpCode(HttpStatus.OK)
  async getActivePromotions(
    @Res() res: Response,
    @Query("isActive") isActive?: string,
  ) {
    const isActiveBool =
      isActive === undefined ? true : isActive.toLowerCase() === "true";
    const result =
      await this.promotionsService.getActivePromotions(isActiveBool);
    res.json({ success: true, data: result });
    res.end();
  }
}
