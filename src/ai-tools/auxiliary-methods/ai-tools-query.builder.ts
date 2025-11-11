import { Prisma } from '@prisma/client';
import { BaseQueryBuilder } from '../../prisma/auxiliary-methods/base-query-builder';
import { AiToolsFilter } from '../entities/ai-tool-filter.entity';

export class AiToolsQueryBuilder extends BaseQueryBuilder {
  buildMessageWhere(filters: AiToolsFilter): Prisma.MessageWhereInput {
    const { search, chatId, senderId, ...rest } = filters ?? {};
    const base = this.build(rest as Record<string, unknown>);
    const where: Prisma.MessageWhereInput = { ...(base as object) };
    if (search) where.content = this.ciContains(search);
    if (chatId) where.chatId = chatId;
    if (senderId) where.senderId = senderId;
    return where;
  }
}
