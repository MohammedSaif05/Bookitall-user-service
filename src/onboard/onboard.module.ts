import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { StorageModule } from "../common/storage/storage.module.js";
import { OnboardController } from "./onboard.controller.js";
import { VendorsController } from "./vendors.controller.js";
import { OnboardService } from "./onboard.service.js";
import { Vendor, VendorSchema } from "../modules/auth/schemas/vendor.schema.js";

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Vendor.name, schema: VendorSchema }]),
    StorageModule,
  ],
  controllers: [OnboardController, VendorsController],
  providers: [OnboardService],
})
export class OnboardModule {}
