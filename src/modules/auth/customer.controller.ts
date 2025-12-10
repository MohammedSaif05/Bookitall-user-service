import { Body, Controller, Param, Patch } from "@nestjs/common";
import { AuthService } from "./auth.service.js";
import { UpdateCustomerDetailsDto } from "./dto/update-customer-details.dto.js";

@Controller("customer")
export class CustomerController {
  constructor(private readonly authService: AuthService) {}

  @Patch("update-details/:userId")
  async updateCustomerDetails(
    @Param("userId") userId: string,
    @Body() payload: UpdateCustomerDetailsDto,
  ) {
    return this.authService.updateCustomerDetails(userId, payload.customerName);
  }
}
