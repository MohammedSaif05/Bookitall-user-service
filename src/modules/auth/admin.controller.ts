import { Body, Controller, Post } from "@nestjs/common";
import { AdminService } from "./admin.service.js";
import { AdminLoginDto } from "./dto/admin-login.dto.js";

@Controller("admins")
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Post("login")
  login(@Body() payload: AdminLoginDto) {
    return this.adminService.login(payload.email, payload.password);
  }
}

