import { ExtractJwt, Strategy } from 'passport-jwt';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';

import { JwtPayload } from '@/auth/types/jwt-payload-type';
import { PrismaService } from '@/prisma/prisma.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private readonly prisma: PrismaService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET as string,
    });
  }

  async validate(jwtPayload: JwtPayload) {
    const user = await this.prisma.user.findUnique({
      where: { id: jwtPayload.sub },
      include: { profile: true },
    });

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    if (!user.profile) {
      try {
        const newProfile = await this.prisma.profile.create({
          data: {
            name: user.email.split('@')[0],
            userId: user.id,
            tokensBalance: 30,
          },
        });
        user.profile = newProfile;
      } catch (_error) {
        throw new UnauthorizedException(
          'User profile not found and could not be created',
        );
      }
    }

    return {
      ...jwtPayload,
      profileId: user.profile.id,
    };
  }
}
