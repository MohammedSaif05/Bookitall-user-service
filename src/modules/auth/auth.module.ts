import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { AdminController } from "./admin.controller.js";
import { AdminService } from "./admin.service.js";
import { AuthController } from "./auth.controller.js";
import { AuthService } from "./auth.service.js";
import { Admin, AdminSchema } from "./schemas/admin.schema.js";
import { User, UserSchema } from "./schemas/user.schema.js";
import { Vendor, VendorSchema } from "./schemas/vendor.schema.js";

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },
      { name: Vendor.name, schema: VendorSchema },
      { name: Admin.name, schema: AdminSchema },
    ]),
  ],
  controllers: [AuthController, AdminController],
  providers: [AuthService, AdminService],
})
export class AuthModule {}
