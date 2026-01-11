import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { StorageModule } from "../common/storage/storage.module.js";
import { OnboardController } from "./onboard.controller.js";
import { VendorsController } from "./vendors.controller.js";
import { OnboardService } from "./onboard.service.js";
import { Vendor, VendorSchema } from "../modules/auth/schemas/vendor.schema.js";
import { Business, BusinessSchema } from "./schemas/business.schema.js";
import { Service, ServiceSchema } from "./schemas/service.schema.js";
import { Staff, StaffSchema } from "./schemas/staff.schema.js";
import {
  ServiceAvailability,
  ServiceAvailabilitySchema,
} from "./schemas/service-availability.schema.js";
import {
  ServiceApproval,
  ServiceApprovalSchema,
} from "./schemas/service-approval.schema.js";
import { Category, CategorySchema } from "./schemas/category.schema.js";
import { CategoriesController } from "./categories.controller.js";
import { CategoriesPublicController } from "./categories-public.controller.js";

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Vendor.name, schema: VendorSchema },
      { name: Business.name, schema: BusinessSchema },
      { name: Service.name, schema: ServiceSchema },
      { name: Staff.name, schema: StaffSchema },
      { name: ServiceAvailability.name, schema: ServiceAvailabilitySchema },
      { name: ServiceApproval.name, schema: ServiceApprovalSchema },
      { name: Category.name, schema: CategorySchema },
    ]),
    StorageModule,
  ],
  controllers: [
    OnboardController,
    VendorsController,
    CategoriesController,
    CategoriesPublicController,
  ],
  providers: [OnboardService],
})
export class OnboardModule {}
