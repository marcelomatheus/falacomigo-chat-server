import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';

@Injectable()
export class AuthTokenCleanupScheduler implements OnModuleInit {
  private readonly logger = new Logger(AuthTokenCleanupScheduler.name);

  constructor(
    @InjectQueue('auth-maintenance-queue')
    private readonly maintenanceQueue: Queue,
  ) {}

  async onModuleInit(): Promise<void> {
    await this.maintenanceQueue.add(
      'cleanup-expired-auth-tokens',
      {},
      {
        jobId: 'cleanup-expired-auth-tokens-job',
        repeat: {
          every: 60 * 60 * 1000,
        },
        removeOnComplete: true,
        removeOnFail: 100,
      },
    );

    this.logger.log('Expired auth token cleanup job scheduled.');
  }
}
