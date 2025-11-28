"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthModule = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const auth_controller_js_1 = require("./auth.controller.js");
const auth_service_js_1 = require("./auth.service.js");
const user_schema_js_1 = require("./schemas/user.schema.js");
const vendor_schema_js_1 = require("./schemas/vendor.schema.js");
let AuthModule = class AuthModule {
};
exports.AuthModule = AuthModule;
exports.AuthModule = AuthModule = __decorate([
    (0, common_1.Module)({
        imports: [
            mongoose_1.MongooseModule.forFeature([
                { name: user_schema_js_1.User.name, schema: user_schema_js_1.UserSchema },
                { name: vendor_schema_js_1.Vendor.name, schema: vendor_schema_js_1.VendorSchema },
            ]),
        ],
        controllers: [auth_controller_js_1.AuthController],
        providers: [auth_service_js_1.AuthService],
    })
], AuthModule);
//# sourceMappingURL=auth.module.js.map