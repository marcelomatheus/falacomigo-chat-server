import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '@/prisma/prisma.service';
import { MessageEntity } from './entities/message.entity';
import { MessageQueryBuilder } from './auxiliary-methods/message-query.builder';
import { CreateMessageDto } from './dto/create-message.dto';
import { FilterMessageDto } from './dto/filter-message.dto';
import { UpdateMessageDto } from './dto/update-message.dto';

@Injectable()
export class MessageService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateMessageDto): Promise<MessageEntity> {
    return this.prisma.message.create({
      data: dto,
    });
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
    return this.prisma.message.findMany({
      where,
      skip: (page - 1) * limit,
      take: 50,
      orderBy: { [orderBy]: orderDirection },
    });
  }

  async findOne(id: string): Promise<MessageEntity> {
    const message = await this.prisma.message.findUnique({ where: { id } });
    if (!message) throw new NotFoundException('Message not found');
    return message;
  }

  async update(id: string, dto: UpdateMessageDto): Promise<MessageEntity> {
    return this.prisma.message.update({
      where: { id },
      data: dto,
    });
  }

  async remove(id: string): Promise<boolean> {
    await this.prisma.message.delete({ where: { id } });
    return true;
  }
}
