import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateChatDto } from './dto/create-chat.dto';
import { UpdateChatDto } from './dto/update-chat.dto';
import { PrismaService } from '@/prisma/prisma.service';
import { FilterChatDto } from './dto/filter-chat.dto';
import { ChatQueryBuilder } from './auxiliary-methods/chat-query.builder';
import { ChatEntity } from './entities/chat.entity';
import { CreateMessageData } from './interfaces/create-message.interface';
import { MessageWithSender } from './interfaces/message-with-sender.interface';
import { EncryptionService } from '@/common/security/encryption.service';

type ChatListItem = ChatEntity & {
  participants: {
    id: string;
    name: string;
    photoUrl: string | null;
  }[];
  lastMessage: {
    id: string;
    content: string;
    senderId: string;
    createdAt: Date;
  } | null;
};

@Injectable()
export class ChatService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly encryptionService: EncryptionService,
  ) {}

  async create(createChatDto: CreateChatDto) {
    const uniqueParticipantIds = Array.from(
      new Set(createChatDto.participantIds),
    );

    const chat = await this.prisma.chat.create({
      data: {
        name: createChatDto.name ?? null,
        isGroup: createChatDto.isGroup ?? false,
        participants: {
          connect: uniqueParticipantIds.map((id) => ({ id })),
        },
      },
    });

    await Promise.all(
      uniqueParticipantIds.map((profileId) =>
        this.prisma.profile.update({
          where: { id: profileId },
          data: { chatIds: { push: chat.id } },
        }),
      ),
    );

    return chat;
  }

  async findAll(filters: FilterChatDto): Promise<ChatListItem[]> {
    const {
      page = 1,
      limit = 30,
      orderBy = 'createdAt',
      orderDirection = 'desc',
      participantId,
      search,
      ...rest
    } = filters ?? ({} as FilterChatDto);

    const safeOrderBy = ['createdAt', 'updatedAt', 'name'].includes(
      String(orderBy),
    )
      ? orderBy
      : 'createdAt';
    const qb = new ChatQueryBuilder();
    const where = qb.buildWhere({ search, participantId, ...rest });
    const chats = await this.prisma.chat.findMany({
      where,
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { [safeOrderBy]: orderDirection },
      include: {
        participants: true,
        messages: {
          orderBy: { createdAt: 'desc' },
          take: 1,
          select: {
            id: true,
            content: true,
            senderId: true,
            createdAt: true,
          },
        },
      },
    });

    return chats.map(({ messages, ...chat }) => ({
      ...chat,
      lastMessage: messages[0]
        ? {
            ...messages[0],
            content: this.encryptionService.decrypt(messages[0].content),
          }
        : null,
    }));
  }

  async findOne(id: string): Promise<ChatListItem> {
    const chat = await this.prisma.chat.findUnique({
      where: { id },
      include: {
        participants: true,
        messages: {
          orderBy: { createdAt: 'desc' },
          take: 1,
          select: {
            id: true,
            content: true,
            senderId: true,
            createdAt: true,
          },
        },
      },
    });
    if (!chat) throw new NotFoundException('Chat not found');
    const { messages, ...chatData } = chat;
    return {
      ...chatData,
      lastMessage: messages[0]
        ? {
            ...messages[0],
            content: this.encryptionService.decrypt(messages[0].content),
          }
        : null,
    };
  }

  async createMessage(data: CreateMessageData): Promise<MessageWithSender> {
    const message = await this.prisma.message.create({
      data: {
        content: data.content,
        chatId: data.chatId,
        senderId: data.senderId,
      },
      include: {
        sender: {
          select: {
            id: true,
            name: true,
            photoUrl: true,
          },
        },
      },
    });

    return {
      ...message,
      content: this.encryptionService.decrypt(message.content),
    } as unknown as MessageWithSender;
  }

  async getMessagesSince(
    profileId: string,
    since?: Date,
  ): Promise<MessageWithSender[]> {
    const profile = await this.prisma.profile.findUnique({
      where: { id: profileId },
      select: { chatIds: true, createdAt: true },
    });

    if (!profile || !profile.chatIds.length) {
      return [];
    }

    const sinceDate = since ?? profile.createdAt;
    const messages = await this.prisma.message.findMany({
      where: {
        chatId: { in: profile.chatIds },
        ...(sinceDate ? { createdAt: { gt: sinceDate } } : {}),
      },
      orderBy: {
        createdAt: 'asc',
      },
      include: {
        sender: {
          select: {
            id: true,
            name: true,
            photoUrl: true,
          },
        },
      },
    });

    return messages.map((msg) => ({
      ...msg,
      content: this.encryptionService.decrypt(msg.content),
    })) as unknown as MessageWithSender[];
  }

  async update(id: string, updateChatDto: UpdateChatDto): Promise<ChatEntity> {
    return this.prisma.chat.update({
      where: { id },
      data: {
        name: updateChatDto.name,
        isGroup: updateChatDto.isGroup,
        participantIds: updateChatDto.participantIds,
      },
    });
  }

  async remove(id: string): Promise<boolean> {
    await this.prisma.chat.delete({ where: { id } });
    return true;
  }

  async findOrCreateChat(
    profileId: string,
    recipientId: string,
  ): Promise<{ chatId: string; isNew: boolean }> {
    const existingChat = await this.prisma.chat.findFirst({
      where: {
        isGroup: false,
        AND: [
          { participantIds: { has: profileId } },
          { participantIds: { has: recipientId } },
        ],
      },
    });

    if (existingChat) {
      return { chatId: existingChat.id, isNew: false };
    }

    const newChat = await this.prisma.chat.create({
      data: {
        participantIds: [profileId, recipientId],
        isGroup: false,
      },
    });

    await this.prisma.profile.update({
      where: { id: profileId },
      data: {
        chatIds: { push: newChat.id },
      },
    });

    await this.prisma.profile.update({
      where: { id: recipientId },
      data: {
        chatIds: { push: newChat.id },
      },
    });
    return { chatId: newChat.id, isNew: true };
  }
}
