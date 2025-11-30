import { Socket } from 'socket.io';
import { JwtPayload } from '@/auth/types/jwt-payload-type';

export interface AuthenticatedSocket extends Socket {
  data: {
    user: JwtPayload;
    profileId: string;
  };
}
