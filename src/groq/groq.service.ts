import { Injectable, Inject } from '@nestjs/common';
import { GROQ_CLIENT } from './groq.provider';
import Groq from 'groq-sdk';

@Injectable()
export class GroqService {
  constructor(@Inject(GROQ_CLIENT) private readonly groq: Groq) {}

  async chat(data: { systemPrompt: string; content: string }) {
    const model = 'openai/gpt-oss-20b';

    const { systemPrompt, content } = data;

    try {
      const response = await this.groq.chat.completions.create({
        model,
        messages: [
          {
            role: 'system',
            content: systemPrompt,
          },
          {
            role: 'user',
            content,
          },
        ],
      });

      return response.choices[0]?.message?.content;
    } catch (error) {
      console.error('[Groq - Service]: ', error);
      throw error;
    }
  }
}
