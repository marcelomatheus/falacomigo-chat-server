import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '@/prisma/prisma.service';
import { MessageEntity } from './entities/message.entity';
import { MessageQueryBuilder } from './auxiliary-methods/message-query.builder';
import { CreateMessageDto } from './dto/create-message.dto';
import { FilterMessageDto } from './dto/filter-message.dto';
import { UpdateMessageDto } from './dto/update-message.dto';
import { EncryptionService } from '@/common/security/encryption.service';

@Injectable()
export class MessageService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly encryptionService: EncryptionService,
  ) {}

  async create(dto: CreateMessageDto): Promise<MessageEntity> {
    const message = await this.prisma.message.create({
      data: {
        ...dto,
      },
    });

    return {
      ...message,
      content: this.encryptionService.decrypt(message.content),
    };
  }

  async findAll(filters: FilterMessageDto): Promise<MessageEntity[]> {
    const {
      search,
      chatId,
      senderId,
      page = 1,
      limit = 20,
      orderBy = 'createdAt',
      orderDirection = 'desc',
      ...rest
    } = filters ?? {};

    const qb = new MessageQueryBuilder();
    const where = qb.buildWhere({ search, chatId, senderId, ...rest });
    const messages = await this.prisma.message.findMany({
      where,
      skip: (page - 1) * limit,
      take: 50,
      orderBy: { [orderBy]: orderDirection },
    });

    return messages.map((msg) => ({
      ...msg,
      content: this.encryptionService.decrypt(msg.content),
    }));
  }

  async findOne(id: string): Promise<MessageEntity> {
    const message = await this.prisma.message.findUnique({ where: { id } });
    if (!message) throw new NotFoundException('Message not found');

    return {
      ...message,
      content: this.encryptionService.decrypt(message.content),
    };
  }

  async update(id: string, dto: UpdateMessageDto): Promise<MessageEntity> {
    const data = { ...dto };
    if (data.content) {
      data.content = this.encryptionService.decrypt(data.content);
    }

    const message = await this.prisma.message.update({
      where: { id },
      data,
    });

    return {
      ...message,
      content: this.encryptionService.decrypt(message.content),
    };
  }

  async remove(id: string): Promise<boolean> {
    await this.prisma.message.delete({ where: { id } });
    return true;
  }
}
