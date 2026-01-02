import { Controller, Get, Param } from "@nestjs/common";
import { VerificationService } from "./verification.service.js";

@Controller("verification")
export class VerificationController {
  constructor(private readonly verificationService: VerificationService) {}

  @Get("verify-ifsc/:ifscCode")
  verifyIfsc(@Param("ifscCode") ifscCode: string) {
    return this.verificationService.verifyIfsc(ifscCode);
  }
}
