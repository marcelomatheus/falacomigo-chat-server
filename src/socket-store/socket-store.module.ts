import { Module, Global } from '@nestjs/common';
import Redis from 'ioredis';

@Global()
@Module({
  providers: [
    // {
    //   provide: 'REDIS_CLIENT',
    //   useFactory: () => {
    //     return new Redis(String(process.env.REDIS_URL));
    //   },
    // },
  ],
  exports: ['REDIS_CLIENT'],
})
export class SocketStoreModule {}
