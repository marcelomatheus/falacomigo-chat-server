import { Provider } from '@nestjs/common';

export const MAILGUN_CLIENT = Symbol('MAILGUN_CLIENT');

export type MailgunRequest = {
  method: 'GET' | 'POST';
  path: string;
  body?: Record<string, string>;
  query?: Record<string, string | number>;
};

export type MailgunClient = {
  request: (data: MailgunRequest) => Promise<unknown>;
};

const resolveBaseUrl = () =>
  process.env.MAILGUN_BASE_URL || 'https://api.mailgun.net';

export const mailgunProvider: Provider = {
  provide: MAILGUN_CLIENT,
  useFactory: (): MailgunClient => {
    const apiKey = process.env.MAILGUN_API_KEY;
    const domain = process.env.MAILGUN_DOMAIN;

    if (!apiKey) {
      throw new Error('MAILGUN_API_KEY is not configured.');
    }

    if (!domain) {
      throw new Error('MAILGUN_DOMAIN is not configured.');
    }

    const authHeader = `Basic ${Buffer.from(`api:${apiKey}`).toString('base64')}`;

    return {
      request: async ({ method, path, body, query }: MailgunRequest) => {
        const url = new URL(`${resolveBaseUrl()}/v3/${domain}${path}`);

        if (query) {
          for (const [key, value] of Object.entries(query)) {
            url.searchParams.set(key, String(value));
          }
        }

        const response = await fetch(url.toString(), {
          method,
          headers: {
            Authorization: authHeader,
            ...(method === 'POST'
              ? {
                  'Content-Type': 'application/x-www-form-urlencoded',
                }
              : {}),
          },
          body:
            method === 'POST' && body
              ? new URLSearchParams(body).toString()
              : undefined,
        });

        if (!response.ok) {
          const mailgunError = await response.text();
          throw new Error(
            `Mailgun request failed (${response.status}): ${mailgunError}`,
          );
        }

        const responseData: unknown = await response.json();
        return responseData;
      },
    };
  },
};
