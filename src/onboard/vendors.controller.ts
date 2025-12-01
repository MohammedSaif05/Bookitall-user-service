import { Controller, Get, Param } from "@nestjs/common";
import { OnboardService } from "./onboard.service.js";

@Controller("vendors")
export class VendorsController {
  constructor(private readonly onboardService: OnboardService) {}

  @Get(":location")
  getByLocation(@Param("location") location: string) {
    return this.onboardService.getVendorsByLocation(location);
  }

  @Get("pending")
  getPendingVerificationVendors() {
    return this.onboardService.getVendorsPendingVerification();
  }
}

