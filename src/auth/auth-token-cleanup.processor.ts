import { Injectable, Logger } from '@nestjs/common';
import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';

import { PrismaService } from '@/prisma/prisma.service';

@Injectable()
@Processor('auth-maintenance-queue')
export class AuthTokenCleanupProcessor extends WorkerHost {
  private readonly logger = new Logger(AuthTokenCleanupProcessor.name);

  constructor(private readonly prisma: PrismaService) {
    super();
  }

  async process(
    job: Job<Record<string, never>, unknown, string>,
  ): Promise<void> {
    if (job.name !== 'cleanup-expired-auth-tokens') {
      this.logger.warn(`Maintenance job ignored: ${job.name}`);
      return;
    }

    const deleted = await this.prisma.authToken.deleteMany({
      where: {
        expiresAt: {
          lt: new Date(),
        },
      },
    });

    if (deleted.count > 0) {
      this.logger.log(
        `Expired auth tokens cleanup removed ${deleted.count} records.`,
      );
    }
  }
}
