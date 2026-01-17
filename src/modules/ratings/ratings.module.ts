import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { RatingsService } from "./ratings.service.js";
import { RatingsController } from "./ratings.controller.js";
import {
  BusinessRating,
  BusinessRatingSchema,
} from "./schemas/business-rating.schema.js";
import {
  Business,
  BusinessSchema,
} from "../../onboard/schemas/business.schema.js";

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: BusinessRating.name, schema: BusinessRatingSchema },
      { name: Business.name, schema: BusinessSchema },
    ]),
  ],
  controllers: [RatingsController],
  providers: [RatingsService],
  exports: [RatingsService],
})
export class RatingsModule {}
