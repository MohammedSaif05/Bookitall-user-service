import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { randomUUID } from "node:crypto";
import { Model, Types } from "mongoose";
import { R2Service } from "../../common/storage/r2.service.js";
import {
  PromotionRequest,
  PromotionRequestDocument,
} from "./schemas/promotion-request.schema.js";
import {
  PromotionAsset,
  PromotionAssetDocument,
} from "./schemas/promotion-asset.schema.js";
import { Promotion, PromotionDocument } from "./schemas/promotion.schema.js";
import { CreatePromotionRequestDto } from "./dto/create-promotion-request.dto.js";
import { UploadPromotionImagesDto } from "./dto/upload-promotion-images.dto.js";
import {
  Business,
  BusinessDocument,
} from "../../onboard/schemas/business.schema.js";

@Injectable()
export class PromotionsService {
  constructor(
    @InjectModel(PromotionRequest.name)
    private readonly promotionRequestModel: Model<PromotionRequestDocument>,
    @InjectModel(PromotionAsset.name)
    private readonly promotionAssetModel: Model<PromotionAssetDocument>,
    @InjectModel(Promotion.name)
    private readonly promotionModel: Model<PromotionDocument>,
    @InjectModel(Business.name)
    private readonly businessModel: Model<BusinessDocument>,
    private readonly r2Service: R2Service,
  ) {}

  /**
   * Step 1: Vendor submits promotion request
   */
  async createPromotionRequest(
    vendorId: string,
    createDto: CreatePromotionRequestDto,
  ) {
    const promotionRequest = new this.promotionRequestModel({
      vendorId,
      category: createDto.category,
      description: createDto.description,
      durationType: createDto.durationType,
      status: "pending",
    });

    const saved = await promotionRequest.save();
    return {
      requestId: saved._id.toString(),
      vendorId: saved.vendorId,
      category: saved.category,
      description: saved.description,
      durationType: saved.durationType,
      status: saved.status,
      createdAt: saved.createdAt,
    };
  }

  /**
   * Step 2: Admin uploads promotion images
   */
  async uploadPromotionImages(
    requestId: string,
    uploadDto: UploadPromotionImagesDto,
    files: { promotionImages?: Array<{ buffer: Buffer; mimetype: string }> },
  ): Promise<{ imageUrls: string[]; assetIds: string[] }> {
    // Validate requestId
    if (uploadDto.requestId !== requestId) {
      throw new BadRequestException(
        "requestId in request body does not match requestId in route parameter",
      );
    }

    // Find the promotion request
    const promotionRequest = await this.promotionRequestModel
      .findById(requestId)
      .exec();

    if (!promotionRequest) {
      throw new NotFoundException(
        `Promotion request with id ${requestId} not found`,
      );
    }

    // Validate files
    const images = files.promotionImages ?? [];

    if (!Array.isArray(images) || images.length !== 4) {
      throw new BadRequestException(
        "promotionImages must contain exactly 4 files",
      );
    }

    // Validate files before upload starts
    for (const file of images) {
      if (!file.buffer || !file.mimetype) {
        throw new BadRequestException("Invalid file upload");
      }
    }

    const uploadedUrls: string[] = [];
    const assetIds: string[] = [];

    try {
      // Upload all images to R2
      for (let i = 0; i < images.length; i++) {
        const file = images[i];
        const key = `promotions/${requestId}/promotion-image-${randomUUID()}-${i}`;

        await this.r2Service.uploadObject(key, file.buffer, file.mimetype);

        const imageUrl = this.r2Service.getPublicUrl(key);
        uploadedUrls.push(imageUrl);

        // Create promotion asset document
        const asset = new this.promotionAssetModel({
          promotionRequestId: new Types.ObjectId(requestId),
          imageUrl,
          isSelectedByVendor: false,
        });

        const savedAsset = await asset.save();
        assetIds.push(savedAsset._id.toString());
      }

      // Update promotion request status
      promotionRequest.status = "images_uploaded";
      await promotionRequest.save();

      return {
        imageUrls: uploadedUrls,
        assetIds,
      };
    } catch (error) {
      // Cleanup uploaded files on error
      for (const url of uploadedUrls) {
        const key = this.r2Service.getKeyFromUrl(url);
        if (key) {
          try {
            await this.r2Service.deleteObject(key);
          } catch {
            // Ignore delete errors during cleanup
          }
        }
      }
      throw error;
    }
  }

  /**
   * Step 3: Vendor fetches their promotion requests
   */
  async getVendorPromotionRequests(vendorId: string) {
    const requests = await this.promotionRequestModel
      .find({ vendorId })
      .sort({ createdAt: -1 })
      .exec();

    return requests.map((req) => ({
      requestId: req._id.toString(),
      vendorId: req.vendorId,
      category: req.category,
      description: req.description,
      durationType: req.durationType,
      status: req.status,
      createdAt: req.createdAt,
      updatedAt: req.updatedAt,
    }));
  }

  /**
   * Admin fetches all promotion requests (with optional status filter)
   */
  async getAllPromotionRequests(status?: string) {
    const query: { status?: string } = {};
    if (status) {
      query.status = status;
    }

    const requests = await this.promotionRequestModel
      .find(query)
      .sort({ createdAt: -1 })
      .exec();

    // Get unique vendor IDs
    const vendorIds = [...new Set(requests.map((req) => req.vendorId))];

    // Fetch business information for all vendors
    const businesses = await this.businessModel
      .find({ vendorId: { $in: vendorIds } })
      .lean()
      .exec();

    // Create a map of vendorId to business info for quick lookup
    const businessMap = new Map(
      businesses.map((business) => [
        business.vendorId,
        {
          businessName: business.businessName,
          businessCategory: business.businessCategory,
          city: business.address?.city || null,
        },
      ]),
    );

    return requests.map((req) => {
      const businessInfo = businessMap.get(req.vendorId) || {
        businessName: null,
        businessCategory: null,
        city: null,
      };

      return {
        requestId: req._id.toString(),
        vendorId: req.vendorId,
        category: req.category,
        description: req.description,
        durationType: req.durationType,
        status: req.status,
        businessName: businessInfo.businessName,
        businessCategory: businessInfo.businessCategory,
        city: businessInfo.city,
        createdAt: req.createdAt,
        updatedAt: req.updatedAt,
      };
    });
  }

  /**
   * Step 4: Vendor fetches promotional images for a request
   */
  async getPromotionAssets(vendorId: string, requestId: string) {
    // Validate that the promotion request belongs to the vendor
    const promotionRequest = await this.promotionRequestModel
      .findById(requestId)
      .exec();

    if (!promotionRequest) {
      throw new NotFoundException(
        `Promotion request with id ${requestId} not found`,
      );
    }

    if (promotionRequest.vendorId !== vendorId) {
      throw new ForbiddenException(
        "You do not have permission to access this promotion request",
      );
    }

    // Fetch all assets for this promotion request
    const assets = await this.promotionAssetModel
      .find({ promotionRequestId: new Types.ObjectId(requestId) })
      .exec();

    return assets.map((asset) => ({
      assetId: asset._id.toString(),
      imageUrl: asset.imageUrl,
      isSelectedByVendor: asset.isSelectedByVendor,
    }));
  }

  /**
   * Step 5: Vendor selects ONE image
   */
  async selectPromotionAsset(vendorId: string, assetId: string) {
    // Find the asset
    const asset = await this.promotionAssetModel.findById(assetId).exec();

    if (!asset) {
      throw new NotFoundException(
        `Promotion asset with id ${assetId} not found`,
      );
    }

    // Validate that the asset belongs to a promotion request owned by the vendor
    const promotionRequest = await this.promotionRequestModel
      .findById(asset.promotionRequestId)
      .exec();

    if (!promotionRequest) {
      throw new NotFoundException("Promotion request not found");
    }

    if (promotionRequest.vendorId !== vendorId) {
      throw new ForbiddenException(
        "You do not have permission to select this asset",
      );
    }

    // Ensure only one asset is selected for this promotion request
    // First, unselect all other assets for this request
    await this.promotionAssetModel
      .updateMany(
        {
          promotionRequestId: asset.promotionRequestId,
          _id: { $ne: asset._id },
        },
        { $set: { isSelectedByVendor: false } },
      )
      .exec();

    // Select this asset
    asset.isSelectedByVendor = true;
    await asset.save();

    return {
      assetId: asset._id.toString(),
      imageUrl: asset.imageUrl,
      isSelectedByVendor: asset.isSelectedByVendor,
      message: "Asset selected successfully",
    };
  }

  /**
   * Step 6: Admin approves promotion
   */
  async approvePromotion(requestId: string) {
    // Find the promotion request
    const promotionRequest = await this.promotionRequestModel
      .findById(requestId)
      .exec();

    if (!promotionRequest) {
      throw new NotFoundException(
        `Promotion request with id ${requestId} not found`,
      );
    }

    // Find the selected asset
    const selectedAsset = await this.promotionAssetModel
      .findOne({
        promotionRequestId: new Types.ObjectId(requestId),
        isSelectedByVendor: true,
      })
      .exec();

    if (!selectedAsset) {
      throw new BadRequestException(
        "No asset has been selected by the vendor for this promotion request",
      );
    }

    // Calculate start and end dates
    const now = new Date();
    const startDate = new Date(now);
    let endDate: Date;

    if (promotionRequest.durationType === "weekly") {
      endDate = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000); // +7 days
    } else {
      // monthly
      endDate = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000); // +30 days
    }

    // Create promotion document
    const promotion = new this.promotionModel({
      vendorId: promotionRequest.vendorId,
      promotionRequestId: new Types.ObjectId(requestId),
      promotionAssetId: selectedAsset._id,
      imageUrl: selectedAsset.imageUrl,
      category: promotionRequest.category,
      description: promotionRequest.description,
      startDate,
      endDate,
      isActive: true,
    });

    const savedPromotion = await promotion.save();

    // Update promotion request status
    promotionRequest.status = "approved";
    await promotionRequest.save();

    return {
      promotionId: savedPromotion._id.toString(),
      vendorId: savedPromotion.vendorId,
      imageUrl: savedPromotion.imageUrl,
      category: savedPromotion.category,
      description: savedPromotion.description,
      startDate: savedPromotion.startDate,
      endDate: savedPromotion.endDate,
      isActive: savedPromotion.isActive,
      message: "Promotion approved successfully",
    };
  }

  /**
   * Step 7: User fetches active promotions
   */
  async getActivePromotions(isActive?: boolean) {
    const now = new Date();
    const query: {
      startDate: { $lte: Date };
      endDate: { $gte: Date };
      isActive: boolean;
    } = {
      startDate: { $lte: now },
      endDate: { $gte: now },
      isActive: isActive !== undefined ? isActive : true,
    };

    const promotions = await this.promotionModel
      .find(query)
      .sort({ createdAt: -1 })
      .exec();

    return promotions.map((promo) => ({
      promotionId: promo._id.toString(),
      vendorId: promo.vendorId,
      imageUrl: promo.imageUrl,
      category: promo.category,
      description: promo.description,
      startDate: promo.startDate,
      endDate: promo.endDate,
      isActive: promo.isActive,
    }));
  }
}
