import { CorrectionSuggestions, TranslationType } from '@prisma/client';
export { CorrectionSuggestions, TranslationType };
export class MessageEntity {
  id!: string;
  content!: string;
  senderId!: string;
  chatId!: string;
  translation?: Record<string, unknown> | null;
  correctionSuggestions?: Record<string, unknown> | null;
  createdAt!: Date;
  updatedAt!: Date;
}
