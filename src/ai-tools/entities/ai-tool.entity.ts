export class AiToolEntity {
  id?: string;
  content: string;
  senderId: string;
  chatId: string;
  translation?: Record<string, unknown> | null;
  correctionSuggestions?: Record<string, unknown> | null;
  createdAt: Date;
  updatedAt: Date;
}
