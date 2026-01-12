import { Body, Controller, Param, Patch } from "@nestjs/common";
import { NotificationsService } from "./notifications.service.js";
import { RegisterDeviceDto } from "./dto/register-device.dto.js";

@Controller("notifications")
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Patch(":userId/register-device")
  async registerDevice(
    @Param("userId") userId: string,
    @Body() payload: RegisterDeviceDto,
  ) {
    return this.notificationsService.registerDevice(
      userId,
      payload.deviceId,
      payload.platform,
      payload.fcmToken,
      payload.appVersion,
    );
  }
}
