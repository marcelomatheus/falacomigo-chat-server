import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateChatDto } from './dto/create-chat.dto';
import { UpdateChatDto } from './dto/update-chat.dto';
import { PrismaService } from '@/prisma/prisma.service';
import { FilterChatDto } from './dto/filter-chat.dto';
import { ChatQueryBuilder } from './auxiliary-methods/chat-query.builder';
import { ChatEntity } from './entities/chat.entity';

@Injectable()
export class ChatService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createChatDto: CreateChatDto) {
    return this.prisma.chat.create({
      data: {
        name: createChatDto.name ?? null,
        isGroup: createChatDto.isGroup ?? false,
        participantIds: createChatDto.participantIds,
      },
    });
  }

  async findAll(filters: FilterChatDto): Promise<ChatEntity[]> {
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

    return this.prisma.chat.findMany({
      where,
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { [safeOrderBy]: orderDirection },
    });
  }

  async findOne(id: string): Promise<ChatEntity> {
    const chat = await this.prisma.chat.findUnique({ where: { id } });
    if (!chat) throw new NotFoundException('Chat not found');
    return chat;
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
}
