import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';

import { AuthService } from '@/auth/auth.service';
import { LoginUserDto } from '@/auth/dto/login-user.dto';
import { RegisterUserDto } from '@/auth/dto/register-user.dto';
import { Public } from '@/auth/decorators/public.decorator';
import { ConfirmAccountService } from '@/auth/confirm-account.service';
import { RequestAccountConfirmationDto } from '@/auth/dto/request-account-confirmation.dto';
import { VerifyAccountConfirmationDto } from '@/auth/dto/verify-account-confirmation.dto';
import { ResetPasswordService } from '@/auth/reset-password.service';
import { RequestPasswordResetDto } from '@/auth/dto/request-password-reset.dto';
import { ConfirmPasswordResetDto } from '@/auth/dto/confirm-password-reset.dto';

@Controller('auth')
export class AuthController {
  constructor(
    private authService: AuthService,
    private confirmAccountService: ConfirmAccountService,
    private resetPasswordService: ResetPasswordService,
  ) {}

  @Public()
  @Throttle({
    default: {
      limit: 8,
      ttl: 60_000,
    },
  })
  @HttpCode(HttpStatus.OK)
  @Post('login')
  login(@Body() loginUserDto: LoginUserDto) {
    return this.authService.login(loginUserDto);
  }

  @Public()
  @Throttle({
    default: {
      limit: 4,
      ttl: 60_000,
    },
  })
  @HttpCode(HttpStatus.OK)
  @Post('register')
  register(@Body() registerUserDto: RegisterUserDto) {
    return this.authService.register(registerUserDto);
  }

  @Public()
  @Throttle({
    default: {
      limit: 3,
      ttl: 60_000,
    },
  })
  @HttpCode(HttpStatus.OK)
  @Post('confirm-account/request')
  requestAccountConfirmation(@Body() dto: RequestAccountConfirmationDto) {
    return this.confirmAccountService.requestCode(dto);
  }

  @Public()
  @Throttle({
    default: {
      limit: 6,
      ttl: 60_000,
    },
  })
  @HttpCode(HttpStatus.OK)
  @Post('confirm-account/verify')
  verifyAccountConfirmation(@Body() dto: VerifyAccountConfirmationDto) {
    return this.confirmAccountService.verifyCode(dto);
  }

  @Public()
  @Throttle({
    default: {
      limit: 1,
      ttl: 90_000,
    },
  })
  @HttpCode(HttpStatus.OK)
  @Post('confirm-account/resend')
  resendAccountConfirmation(@Body() dto: RequestAccountConfirmationDto) {
    return this.confirmAccountService.resendCode(dto);
  }

  @Public()
  @Throttle({
    default: {
      limit: 3,
      ttl: 60_000,
    },
  })
  @HttpCode(HttpStatus.OK)
  @Post('password-reset/request')
  requestPasswordReset(@Body() dto: RequestPasswordResetDto) {
    return this.resetPasswordService.requestReset(dto);
  }

  @Public()
  @Throttle({
    default: {
      limit: 5,
      ttl: 60_000,
    },
  })
  @HttpCode(HttpStatus.OK)
  @Post('password-reset/confirm')
  confirmPasswordReset(@Body() dto: ConfirmPasswordResetDto) {
    return this.resetPasswordService.confirmReset(dto);
  }
}
