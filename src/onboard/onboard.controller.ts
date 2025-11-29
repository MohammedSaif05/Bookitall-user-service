import { Body, Controller, Param, Patch } from "@nestjs/common";
import { OnboardService } from "./onboard.service.js";
import { UpdateVendorDto } from "./dto/update-vendor.dto.js";

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
}
