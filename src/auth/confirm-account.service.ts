import { BadRequestException, Injectable } from '@nestjs/common';
import * as bcrypt from 'bcrypt';

import { PrismaService } from '@/prisma/prisma.service';
import { UserService } from '@/user/user.service';
import { EmailService } from '@/email/email.service';
import { RequestAccountConfirmationDto } from '@/auth/dto/request-account-confirmation.dto';
import { VerifyAccountConfirmationDto } from '@/auth/dto/verify-account-confirmation.dto';
import { ConfirmAccountEntity } from '@/auth/entities/confirm-account.entity';
import { buildConfirmAccountTemplate } from '@/email/templates/confirm-account.template';
import { addMinutes } from '@/common/utils/date-time.util';
import { AuthTokenType } from '@prisma/client';

const CONFIRM_CODE_EXP_MINUTES = 15;

@Injectable()
export class ConfirmAccountService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly userService: UserService,
    private readonly emailService: EmailService,
  ) {}

  async requestCode(
    dto: RequestAccountConfirmationDto,
  ): Promise<ConfirmAccountEntity> {
    const user = await this.userService.findOneByEmail(dto.email);

    if (!user) {
      return {
        message:
          'If the email is registered, a confirmation code will be sent shortly.',
      };
    }

    if (user.confirmEmailTimestamp) {
      return {
        message: 'Your account has already been confirmed.',
      };
    }

    const code = this.generateSixDigitCode();
    const tokenHash = await bcrypt.hash(code, 10);

    const auth = await this.prisma.authToken.create({
      data: {
        userId: user.id,
        type: AuthTokenType.CONFIRM_ACCOUNT,
        tokenHash,
        expiresAt: this.getExpirationDate(CONFIRM_CODE_EXP_MINUTES),
      },
    });
    console.log('auth', auth);

    await this.emailService.sendEmail({
      to: [user.email],
      subject: 'Confirme sua conta no Fala Comigo',
      html: buildConfirmAccountTemplate({
        code,
        appName: 'Fala Comigo',
      }),
      text: `Seu código de confirmação é ${code}. Esse código expira em 15 minutos.`,
      tags: ['auth', 'confirm-account'],
    });

    return {
      message:
        'If the email is registered, a confirmation code will be sent shortly.',
    };
  }

  async resendCode(
    dto: RequestAccountConfirmationDto,
  ): Promise<ConfirmAccountEntity> {
    return this.requestCode(dto);
  }

  async verifyCode(
    dto: VerifyAccountConfirmationDto,
  ): Promise<ConfirmAccountEntity> {
    const user = await this.userService.findOneByEmail(dto.email);

    if (!user) {
      throw new BadRequestException('Invalid or expired confirmation code.');
    }

    if (user.confirmEmailTimestamp) {
      return {
        message: 'Account already confirmed.',
      };
    }

    const activeTokens = await this.prisma.authToken.findMany({
      where: {
        userId: user.id,
        type: AuthTokenType.CONFIRM_ACCOUNT,
        expiresAt: {
          gt: new Date(),
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    if (activeTokens.length === 0) {
      throw new BadRequestException('Invalid or expired confirmation code.');
    }

    let matchedToken: (typeof activeTokens)[number] | null = null;

    for (const token of activeTokens) {
      const isMatch = await bcrypt.compare(dto.code, token.tokenHash);
      if (isMatch) {
        matchedToken = token;
        break;
      }
    }

    if (!matchedToken) {
      throw new BadRequestException('Invalid or expired confirmation code.');
    }

    await this.prisma.$transaction([
      this.prisma.user.update({
        where: { id: user.id },
        data: {
          confirmEmailTimestamp: new Date(),
        },
      }),
      this.prisma.authToken.update({
        where: { id: matchedToken.id },
        data: {
          usedAt: new Date(),
        },
      }),
      this.prisma.authToken.deleteMany({
        where: {
          userId: user.id,
          type: AuthTokenType.CONFIRM_ACCOUNT,
          usedAt: null,
          id: {
            not: matchedToken.id,
          },
        },
      }),
    ]);

    return {
      message: 'Account confirmed successfully.',
    };
  }

  private generateSixDigitCode(): string {
    return Math.floor(Math.random() * 1_000_000)
      .toString()
      .padStart(6, '0');
  }

  private getExpirationDate(minutesToAdd: number): Date {
    return addMinutes(minutesToAdd);
  }
}
