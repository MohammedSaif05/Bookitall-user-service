import {
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Query,
  Res,
} from "@nestjs/common";
import type { Response } from "express";
import { OnboardService } from "./onboard.service.js";
import { NearbyBusinessesDto } from "./dto/nearby-businesses.dto.js";
import { BusinessDetailsDto } from "./dto/business-details.dto.js";

@Controller("businesses")
export class BusinessesPublicController {
  constructor(private readonly onboardService: OnboardService) {}

  /**
   * GET /api/businesses/nearby
   * Get nearby businesses with service price ranges
   */
  @Get("nearby")
  @HttpCode(HttpStatus.OK)
  async getNearbyBusinesses(
    @Query() query: NearbyBusinessesDto,
    @Res() res: Response,
  ) {
    const result = await this.onboardService.getNearbyBusinesses({
      lat: query.lat,
      lng: query.lng,
      radius: query.radius,
      category: query.category,
      page: query.page,
      limit: query.limit,
      sort: query.sort,
    });

    res.json({ success: true, data: result });
    res.end();
  }

  /**
   * GET /api/businesses/:businessId/details
   * Get complete business details with services and reviews
   * Optional query params: lat, lng (for distance calculation)
   */
  @Get(":businessId/details")
  @HttpCode(HttpStatus.OK)
  async getBusinessDetails(
    @Param("businessId") businessId: string,
    @Query() query: BusinessDetailsDto,
    @Res() res: Response,
  ) {
    const userLocation =
      query.lat !== undefined && query.lng !== undefined
        ? {
            lat: query.lat,
            lng: query.lng,
          }
        : undefined;

    const result = await this.onboardService.getBusinessDetails(
      businessId,
      userLocation,
    );
    res.json({ success: true, data: result });
    res.end();
  }
}
