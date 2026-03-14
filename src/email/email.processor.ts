import {
  Inject,
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';

import { MAILGUN_CLIENT, MailgunClient } from '@/email/email.provider';
import { EmailJobData } from '@/email/types/email-job.type';

@Injectable()
@Processor('email-queue')
export class EmailProcessor extends WorkerHost {
  private readonly logger = new Logger(EmailProcessor.name);

  constructor(
    @Inject(MAILGUN_CLIENT) private readonly mailgunClient: MailgunClient,
  ) {
    super();
  }

  async process(job: Job<EmailJobData, unknown, string>): Promise<unknown> {
    if (job.name !== 'send-email-job') {
      this.logger.warn(`Email job ignored: ${job.name}`);
      return null;
    }

    const data = this.ensureJobData(job.data);

    const defaultFrom =
      process.env.MAILGUN_FROM ||
      `Fala Comigo <no-reply@${process.env.MAILGUN_DOMAIN}>`;

    try {
      return await this.mailgunClient.request({
        method: 'POST',
        path: '/messages',
        body: {
          from: data.from || defaultFrom,
          to: data.to.join(','),
          subject: data.subject,
          html: data.html,
          ...(data.text ? { text: data.text } : {}),
          ...(data.tags?.length ? { 'o:tag': data.tags.join(',') } : {}),
        },
      });
    } catch (error) {
      this.logger.error(
        'Error sending queued email through Mailgun',
        error as Error,
      );
      throw new InternalServerErrorException(
        'It was not possible to send email at the moment.',
      );
    }
  }

  private ensureJobData(payload: unknown): EmailJobData {
    if (!payload || typeof payload !== 'object') {
      throw new Error('Invalid email job payload.');
    }

    const data = payload as Partial<EmailJobData>;
    if (
      !Array.isArray(data.to) ||
      typeof data.subject !== 'string' ||
      typeof data.html !== 'string'
    ) {
      throw new Error('Malformed email job payload.');
    }

    return data as EmailJobData;
  }
}
