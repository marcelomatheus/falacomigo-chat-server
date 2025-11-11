export class ChatEntity {
  id!: string;
  name?: string | null;
  isGroup!: boolean;
  participantIds!: string[];
  createdAt!: Date;
  updatedAt!: Date;

  static fromPrisma(chat: {
    id: string;
    name?: string | null;
    isGroup: boolean;
    participantIds: string[];
    createdAt: Date;
    updatedAt: Date;
  }): ChatEntity {
    const e = new ChatEntity();
    e.id = chat.id;
    e.name = chat.name ?? null;
    e.isGroup = chat.isGroup;
    e.participantIds = chat.participantIds ?? [];
    e.createdAt = chat.createdAt;
    e.updatedAt = chat.updatedAt;
    return e;
  }
}
