import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { AuthController } from "./auth.controller.js";
import { AuthService } from "./auth.service.js";
import { User, UserSchema } from "./schemas/user.schema.js";
import { Vendor, VendorSchema } from "./schemas/vendor.schema.js";

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },
      { name: Vendor.name, schema: VendorSchema },
    ]),
  ],
  controllers: [AuthController],
  providers: [AuthService],
})
export class AuthModule {}
