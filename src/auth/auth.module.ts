import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { BullModule } from '@nestjs/bullmq';

import { AuthService } from '@/auth/auth.service';
import { AuthController } from '@/auth/auth.controller';
import { UserModule } from '@/user/user.module';
import { JwtStrategy } from '@/auth/jwt.strategy';
import { ProfileModule } from '@/profile/profile.module';
import { PrismaModule } from '@/prisma/prisma.module';
import { EmailModule } from '@/email/email.module';
import { ConfirmAccountService } from '@/auth/confirm-account.service';
import { ResetPasswordService } from '@/auth/reset-password.service';
import { AuthTokenCleanupProcessor } from '@/auth/auth-token-cleanup.processor';
import { AuthTokenCleanupScheduler } from '@/auth/auth-token-cleanup.scheduler';

@Module({
  imports: [
    UserModule,
    PrismaModule,
    ProfileModule,
    EmailModule,
    BullModule.registerQueue({
      name: 'auth-maintenance-queue',
    }),
    PassportModule,
    JwtModule.registerAsync({
      global: true,
      useFactory: () => ({
        secret: process.env.JWT_SECRET,
        signOptions: { expiresIn: '1d' },
      }),
    }),
  ],
  providers: [
    AuthService,
    JwtStrategy,
    ConfirmAccountService,
    ResetPasswordService,
    AuthTokenCleanupProcessor,
    AuthTokenCleanupScheduler,
  ],
  controllers: [AuthController],
})
export class AuthModule {}
