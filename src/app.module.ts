import { Module } from "@nestjs/common";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { MongooseModule } from "@nestjs/mongoose";
import configuration from "./config/configuration";
import { validateEnv } from "./config/env.validation";
import { AppController } from "./app.controller";
import { AppService } from "./app.service";
import { HealthModule } from "./modules/health/health.module";
import { AuthModule } from "./modules/auth/auth.module";
import { OnboardModule } from "./onboard/onboard.module";
import { StorageModule } from "./common/storage/storage.module";
import { VerificationModule } from "./modules/verification/verification.module";
import { NotificationsModule } from "./modules/notifications/notifications.module";
import { PromotionsModule } from "./modules/promotions/promotions.module";

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
      validate: validateEnv,
    }),
    MongooseModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        uri: configService.getOrThrow<string>("database.uri"),
      }),
    }),
    HealthModule,
    AuthModule,
    OnboardModule,
    StorageModule,
    VerificationModule,
    NotificationsModule,
    PromotionsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
