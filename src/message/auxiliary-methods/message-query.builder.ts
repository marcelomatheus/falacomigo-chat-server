import { Prisma } from '@prisma/client';
import { FilterMessageDto } from '../dto/filter-message.dto';
import { BaseQueryBuilder } from '../../prisma/auxiliary-methods/base-query-builder';

export class MessageQueryBuilder extends BaseQueryBuilder {
  buildWhere(filters: FilterMessageDto): Prisma.MessageWhereInput {
    const { search, chatId, senderId, ...rest } = filters ?? {};
    const base = this.build(rest as Record<string, unknown>);
    const where: Prisma.MessageWhereInput = { ...(base as object) };
    if (search) where.content = this.ciContains(search);
    if (chatId) where.chatId = chatId;
    if (senderId) where.senderId = senderId;
    return where;
  }
}
