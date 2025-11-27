import { BadRequestException, Injectable } from '@nestjs/common';
import { randomUUID } from 'crypto';

@Injectable()
export class AuthService {
  private readonly demoOtp = '123456';

  sendOtp(mobileNo: string) {
    if (!/^\d{10}$/.test(mobileNo)) {
      throw new BadRequestException('mobileNo must be a 10 digit number');
    }

    return {
      message: 'otp sent successfully',
    };
  }

  verifyOtp(mobileNo: string, otp: string) {
    if (!/^\d{10}$/.test(mobileNo)) {
      throw new BadRequestException('mobileNo must be a 10 digit number');
    }

    if (otp !== this.demoOtp) {
      throw new BadRequestException('invalid otp');
    }

    return {
      message: 'otp verified',
      userId: randomUUID(),
    };
  }
}


