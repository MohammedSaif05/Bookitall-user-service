import {
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  NotFoundException,
  Param,
  Patch,
  Body,
  Res,
} from "@nestjs/common";
import type { Response } from "express";
import { RatingsService } from "./ratings.service.js";
import { SubmitRatingDto } from "./dto/submit-rating.dto.js";

@Controller("businesses")
export class RatingsController {
  constructor(private readonly ratingsService: RatingsService) {}

  /**
   * PATCH /api/businesses/:businessId/rating
   * Submit or update a rating for a business
   */
  @Patch(":businessId/rating")
  @HttpCode(HttpStatus.OK)
  async submitRating(
    @Param("businessId") businessId: string,
    @Body() submitDto: SubmitRatingDto,
    @Res() res: Response,
  ) {
    const result = await this.ratingsService.submitRating(
      businessId,
      submitDto,
    );
    res.json({ success: true, data: result });
    res.end();
  }

  /**
   * GET /api/businesses/:businessId/:userId/my-rating
   * Get user's rating for a specific business
   */
  @Get(":businessId/:userId/my-rating")
  @HttpCode(HttpStatus.OK)
  async getUserRating(
    @Param("businessId") businessId: string,
    @Param("userId") userId: string,
    @Res() res: Response,
  ) {
    const rating = await this.ratingsService.getUserRating(businessId, userId);

    if (!rating) {
      throw new NotFoundException(
        `Rating not found for businessId "${businessId}" and userId "${userId}"`,
      );
    }

    res.json({ success: true, data: rating });
    res.end();
  }
}
