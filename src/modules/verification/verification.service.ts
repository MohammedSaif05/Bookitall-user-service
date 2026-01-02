import { Injectable, HttpException } from "@nestjs/common";
import { HttpService } from "@nestjs/axios";
import { ConfigService } from "@nestjs/config";
import { firstValueFrom } from "rxjs";
import type { AxiosResponse, AxiosError } from "axios";

@Injectable()
export class VerificationService {
  private readonly ifscApiKey: string;

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {
    this.ifscApiKey =
      this.configService.get<string>("ifsc.apiKey") ||
      "f55035261a94b50103de695b1b7692ada9db9bbb28f957d57a46dd35aafa8e90";
  }

  async verifyIfsc(ifscCode: string): Promise<{
    success: boolean;
    message: string;
    data: unknown;
  }> {
    try {
      const response = await firstValueFrom<
        AxiosResponse<{
          message?: string;
          data?: unknown;
        }>
      >(
        this.httpService.get(`https://ifsc.in/api/v1/validate/${ifscCode}`, {
          headers: {
            "X-API-KEY": this.ifscApiKey,
          },
        }),
      );

      return {
        success: true,
        message: response.data.message || "IFSC details found",
        data: response.data.data,
      };
    } catch (error) {
      let status = 500;
      let message = "Failed to verify IFSC code";

      if (error && typeof error === "object" && "response" in error) {
        const axiosError = error as AxiosError<{ message?: string }>;
        if (axiosError.response) {
          status = axiosError.response.status || 500;
          message =
            axiosError.response.data?.message || "Failed to verify IFSC code";
        }
      }

      throw new HttpException(
        {
          success: false,
          message,
          data: null,
        },
        status,
      );
    }
  }
}
