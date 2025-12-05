import { Controller, Get, Param } from "@nestjs/common";
import { OnboardService } from "./onboard.service.js";

@Controller("vendors")
export class VendorsController {
  constructor(private readonly onboardService: OnboardService) {}

  @Get("pending")
  getPendingVerificationVendors() {
    return this.onboardService.getVendorsPendingVerification();
  }

  @Get("verified-vendors")
  getVerifiedVendors() {
    return this.onboardService.getVerifiedVendors();
  }

  @Get("verified-vendors-list")
  getVerifiedVendorsList() {
    return this.onboardService.getVerifiedVendorsList();
  }

  @Get("verified-vendors/:location")
  getVerifiedVendorsByLocation(@Param("location") location: string) {
    return this.onboardService.getVendorsByLocation(location);
  }

  @Get(":userId")
  getVendorByUserId(@Param("userId") userId: string) {
    return this.onboardService.getVendorByUserId(userId);
  }
}
