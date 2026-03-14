import { BadRequestException, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { AuthTokenType } from '@prisma/client';
import * as bcrypt from 'bcrypt';

import { PrismaService } from '@/prisma/prisma.service';
import { UserService } from '@/user/user.service';
import { EmailService } from '@/email/email.service';
import { RequestPasswordResetDto } from '@/auth/dto/request-password-reset.dto';
import { ConfirmPasswordResetDto } from '@/auth/dto/confirm-password-reset.dto';
import { ResetPasswordEntity } from '@/auth/entities/reset-password.entity';
import { buildResetPasswordTemplate } from '@/email/templates/reset-password.template';
import { addMinutes } from '@/common/utils/date-time.util';

type PasswordResetPayload = {
  sub: string;
  email: string;
  scope: 'password-reset';
};

const RESET_TOKEN_EXP_MINUTES = 60;

@Injectable()
export class ResetPasswordService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly userService: UserService,
    private readonly emailService: EmailService,
    private readonly jwtService: JwtService,
  ) {}

  async requestReset(
    dto: RequestPasswordResetDto,
  ): Promise<ResetPasswordEntity> {
    const user = await this.userService.findOneByEmail(dto.email);

    if (!user) {
      return {
        message:
          'Se seu email está registradom você receberá um link para redefinir sua senha.',
      };
    }

    const resetToken = this.jwtService.sign(
      {
        sub: user.id,
        email: user.email,
        scope: 'password-reset',
      },
      {
        expiresIn: `${RESET_TOKEN_EXP_MINUTES}m`,
      },
    );

    const tokenHash = await bcrypt.hash(resetToken, 10);

    await this.prisma.authToken.create({
      data: {
        userId: user.id,
        type: AuthTokenType.RESET_PASSWORD,
        tokenHash,
        expiresAt: this.getExpirationDate(RESET_TOKEN_EXP_MINUTES),
      },
    });

    const resetUrl = this.buildResetUrl(resetToken);

    await this.emailService.sendEmail({
      to: [user.email],
      subject: 'Redefina sua senha no Fala Comigo',
      html: buildResetPasswordTemplate({
        appName: 'Fala Comigo',
        resetUrl,
      }),
      text: `Redefina sua senha pelo link: ${resetUrl}`,
      tags: ['auth', 'reset-password'],
    });

    return {
      message:
        'Se seu email está registradom você receberá um link para redefinir sua senha.',
    };
  }

  async confirmReset(
    dto: ConfirmPasswordResetDto,
  ): Promise<ResetPasswordEntity> {
    const payload = this.validateResetToken(dto.token);
    console.log('now', new Date());
    const activeTokens = await this.prisma.authToken.findMany({
      where: {
        userId: payload.sub,
        type: AuthTokenType.RESET_PASSWORD,
        expiresAt: {
          gt: new Date(),
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
    console.log('activeTokens', activeTokens);
    if (activeTokens.length === 0) {
      throw new BadRequestException('Invalid or expired reset token.');
    }

    let matchedToken: (typeof activeTokens)[number] | null = null;

    for (const token of activeTokens) {
      const isMatch = await bcrypt.compare(dto.token, token.tokenHash);
      if (isMatch) {
        matchedToken = token;
        break;
      }
    }

    if (!matchedToken) {
      throw new BadRequestException('Invalid or expired reset token.');
    }

    const hashedPassword = await bcrypt.hash(dto.newPassword, 10);

    await this.prisma.$transaction([
      this.prisma.user.update({
        where: {
          id: payload.sub,
          email: payload.email,
        },
        data: {
          password: hashedPassword,
        },
      }),
      this.prisma.authToken.deleteMany({
        where: {
          userId: payload.sub,
          type: AuthTokenType.RESET_PASSWORD,
          usedAt: null,
        },
      }),
    ]);

    return {
      message: 'Password updated successfully.',
    };
  }

  private validateResetToken(token: string): PasswordResetPayload {
    try {
      const payload = this.jwtService.verify<PasswordResetPayload>(token);
      if (payload.scope !== 'password-reset') {
        throw new BadRequestException('Invalid or expired reset token.');
      }
      return payload;
    } catch {
      throw new BadRequestException('Invalid or expired reset token.');
    }
  }

  private buildResetUrl(token: string): string {
    const baseUrl =
      process.env.RESET_PASSWORD_URL_BASE || 'https://app.falacomigo.space';

    return `${baseUrl}/auth/reset-password?token=${encodeURIComponent(token)}`;
  }

  private getExpirationDate(minutesToAdd: number): Date {
    return addMinutes(minutesToAdd);
  }
}
