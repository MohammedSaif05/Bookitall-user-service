import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { OnboardController } from "./onboard.controller.js";
import { OnboardService } from "./onboard.service.js";
import { Vendor, VendorSchema } from "../modules/auth/schemas/vendor.schema.js";

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Vendor.name, schema: VendorSchema }]),
  ],
  controllers: [OnboardController],
  providers: [OnboardService],
})
export class OnboardModule {}
