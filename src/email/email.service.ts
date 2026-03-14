import {
  Inject,
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';

import { SendEmailDto } from '@/email/dto/send-email.dto';
import { SearchEmailDto } from '@/email/dto/search-email.dto';
import {
  EmailMessageEntity,
  EmailSearchItemEntity,
  EmailSearchResultEntity,
} from '@/email/entities/email-message.entity';
import { MAILGUN_CLIENT, MailgunClient } from '@/email/email.provider';

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);

  constructor(
    @InjectQueue('email-queue') private readonly emailQueue: Queue,
    @Inject(MAILGUN_CLIENT) private readonly mailgunClient: MailgunClient,
  ) {}

  async sendEmail(dto: SendEmailDto): Promise<EmailMessageEntity> {
    try {
      const job = await this.emailQueue.add('send-email-job', dto, {
        attempts: 3,
        backoff: {
          type: 'exponential',
          delay: 3000,
        },
        removeOnComplete: 100,
        removeOnFail: 100,
      });

      return {
        id: String(job.id),
        status: 'queued',
      };
    } catch (error) {
      this.logger.error('Error enqueueing email job', error as Error);
      throw new InternalServerErrorException(
        'It was not possible to send email at the moment.',
      );
    }
  }

  async searchEmails(dto: SearchEmailDto): Promise<EmailSearchResultEntity> {
    try {
      const response = (await this.mailgunClient.request({
        method: 'GET',
        path: '/events',
        query: {
          ...(dto.recipient ? { recipient: dto.recipient } : {}),
          ...(dto.event ? { event: dto.event } : {}),
          limit: dto.limit ?? 20,
        },
      })) as {
        items: Array<{
          event: string;
          timestamp: number;
          recipient: string;
          message?: {
            headers?: {
              subject?: string;
            };
          };
        }>;
      };

      const items: EmailSearchItemEntity[] = (response.items || []).map(
        (item) => ({
          event: item.event,
          recipient: item.recipient,
          timestamp: item.timestamp,
          subject: item.message?.headers?.subject,
        }),
      );

      return { items };
    } catch (error) {
      this.logger.error(
        'Error searching email events on Mailgun',
        error as Error,
      );
      throw new InternalServerErrorException(
        'It was not possible to search emails at the moment.',
      );
    }
  }
}
