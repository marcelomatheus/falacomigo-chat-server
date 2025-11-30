import {
  createParamDecorator,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';

export const CurrentProfile = createParamDecorator(
  (data: unknown, ctx: ExecutionContext): string => {
    const request = ctx.switchToHttp().getRequest();
    const profileId = request.user?.profileId;

    if (!profileId) {
      throw new UnauthorizedException('Profile ID not found in request');
    }

    return profileId;
  },
);
