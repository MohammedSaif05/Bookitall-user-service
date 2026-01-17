import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model, Types } from "mongoose";
import {
  Business,
  BusinessDocument,
} from "../../onboard/schemas/business.schema.js";
import {
  BusinessRating,
  BusinessRatingDocument,
} from "./schemas/business-rating.schema.js";
import { SubmitRatingDto } from "./dto/submit-rating.dto.js";

@Injectable()
export class RatingsService {
  constructor(
    @InjectModel(BusinessRating.name)
    private readonly businessRatingModel: Model<BusinessRatingDocument>,
    @InjectModel(Business.name)
    private readonly businessModel: Model<BusinessDocument>,
  ) {}

  /**
   * Submit or update a rating for a business
   * Handles both first-time ratings (CASE A) and updates (CASE B) atomically
   */
  async submitRating(
    businessId: string,
    submitDto: SubmitRatingDto,
  ): Promise<{
    businessId: string;
    rating: { average: number; count: number };
    userRating: number;
  }> {
    // Validate businessId format
    if (!Types.ObjectId.isValid(businessId)) {
      throw new BadRequestException(
        `Invalid businessId format: "${businessId}"`,
      );
    }

    const businessObjectId = new Types.ObjectId(businessId);
    const session = await this.businessModel.db.startSession();
    session.startTransaction();

    try {
      // Step 1: Validate business exists
      const business = await this.businessModel
        .findById(businessObjectId)
        .session(session)
        .exec();

      if (!business) {
        throw new NotFoundException(
          `Business with id "${businessId}" not found`,
        );
      }

      // Step 2: Check if user already rated this business
      const existingRating = await this.businessRatingModel
        .findOne({
          businessId: businessObjectId,
          userId: submitDto.userId,
        })
        .session(session)
        .exec();

      if (existingRating) {
        // CASE B: User is UPDATING an existing rating
        const oldRating = existingRating.rating;
        const newRating = submitDto.rating;

        // Update business_ratings document
        existingRating.rating = newRating;
        if (submitDto.review !== undefined) {
          existingRating.review = submitDto.review;
        }
        await existingRating.save({ session });

        // Update businesses.rating aggregate
        const currentTotal = business.rating?.total || 0;
        const currentCount = business.rating?.count || 0;
        const newTotal = currentTotal - oldRating + newRating;
        const newAverage = currentCount > 0 ? newTotal / currentCount : 0;

        business.rating = {
          total: newTotal,
          count: currentCount,
          average: Math.round(newAverage * 10) / 10, // Round to 1 decimal place
        };
        await business.save({ session });
      } else {
        // CASE A: User is rating this business for the FIRST TIME
        // Insert new document into business_ratings collection
        const newRatingDoc = new this.businessRatingModel({
          businessId: businessObjectId,
          userId: submitDto.userId,
          rating: submitDto.rating,
          review: submitDto.review,
        });
        await newRatingDoc.save({ session });

        // Update businesses.rating aggregate
        const currentTotal = business.rating?.total || 0;
        const currentCount = business.rating?.count || 0;
        const newCount = currentCount + 1;
        const newTotal = currentTotal + submitDto.rating;
        const newAverage = newTotal / newCount;

        business.rating = {
          total: newTotal,
          count: newCount,
          average: Math.round(newAverage * 10) / 10, // Round to 1 decimal place
        };
        await business.save({ session });
      }

      // Commit transaction
      await session.commitTransaction();

      // Fetch updated business to return latest rating
      const updatedBusiness = await this.businessModel
        .findById(businessObjectId)
        .lean()
        .exec();

      if (!updatedBusiness) {
        throw new NotFoundException(
          `Business with id "${businessId}" not found after update`,
        );
      }

      return {
        businessId: businessId,
        rating: {
          average: updatedBusiness.rating?.average || 0,
          count: updatedBusiness.rating?.count || 0,
        },
        userRating: submitDto.rating,
      };
    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      await session.endSession();
    }
  }

  /**
   * Get user's rating for a specific business
   */
  async getUserRating(
    businessId: string,
    userId: string,
  ): Promise<{
    rating: number;
    review?: string;
    createdAt: Date;
    updatedAt: Date;
  } | null> {
    // Validate businessId format
    if (!Types.ObjectId.isValid(businessId)) {
      throw new BadRequestException(
        `Invalid businessId format: "${businessId}"`,
      );
    }

    const businessObjectId = new Types.ObjectId(businessId);

    const rating = await this.businessRatingModel
      .findOne({
        businessId: businessObjectId,
        userId: userId,
      })
      .lean()
      .exec();

    if (!rating) {
      return null;
    }

    const ratingPlain = rating as unknown as {
      rating: number;
      review?: string;
      createdAt: Date;
      updatedAt: Date;
    };

    return {
      rating: ratingPlain.rating,
      review: ratingPlain.review,
      createdAt: ratingPlain.createdAt,
      updatedAt: ratingPlain.updatedAt,
    };
  }
}
