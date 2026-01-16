import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { StorageModule } from "../../common/storage/storage.module.js";
import { PromotionsService } from "./promotions.service.js";
import { VendorPromotionsController } from "./vendor-promotions.controller.js";
import { AdminPromotionsController } from "./admin-promotions.controller.js";
import { PromotionsController } from "./promotions.controller.js";
import {
  PromotionRequest,
  PromotionRequestSchema,
} from "./schemas/promotion-request.schema.js";
import {
  PromotionAsset,
  PromotionAssetSchema,
} from "./schemas/promotion-asset.schema.js";
import { Promotion, PromotionSchema } from "./schemas/promotion.schema.js";
import {
  Business,
  BusinessSchema,
} from "../../onboard/schemas/business.schema.js";

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: PromotionRequest.name, schema: PromotionRequestSchema },
      { name: PromotionAsset.name, schema: PromotionAssetSchema },
      { name: Promotion.name, schema: PromotionSchema },
      { name: Business.name, schema: BusinessSchema },
    ]),
    StorageModule,
  ],
  controllers: [
    VendorPromotionsController,
    AdminPromotionsController,
    PromotionsController,
  ],
  providers: [PromotionsService],
  exports: [PromotionsService],
})
export class PromotionsModule {}
