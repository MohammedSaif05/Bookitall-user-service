import { Controller, Get, Res } from "@nestjs/common";
import type { Response } from "express";
import { OnboardService } from "./onboard.service.js";

@Controller("categories")
export class CategoriesPublicController {
  constructor(private readonly onboardService: OnboardService) {}

  /**
   * Get active categories (sorted by order ASC)
   * GET method
   */
  @Get()
  async getCategories(@Res() res: Response) {
    const result = await this.onboardService.getCategories();
    res.json({ success: true, data: result });
    res.end();
  }
}
