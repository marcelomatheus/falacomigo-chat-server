import { Injectable, Inject } from '@nestjs/common';
import Redis from 'ioredis';

@Injectable()
export class SocketStoreService {
  constructor(@Inject('REDIS_CLIENT') private readonly redis: Redis) {}

  async saveSocket(profileId: string, socketId: string) {
    await this.redis.set(`socket:${profileId}`, socketId, 'EX', 3600);
  }

  async getSocket(profileId: string) {
    return this.redis.get(`socket:${profileId}`);
  }

  async removeSocket(profileId: string) {
    await this.redis.del(`socket:${profileId}`);
  }
}
