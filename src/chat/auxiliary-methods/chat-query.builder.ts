import { Prisma } from '@prisma/client';
import { FilterChatDto } from '../dto/filter-chat.dto';
import { BaseQueryBuilder } from '../../prisma/auxiliary-methods/base-query-builder';

export class ChatQueryBuilder extends BaseQueryBuilder {
  buildWhere(filters: FilterChatDto): Prisma.ChatWhereInput {
    const { search, participantId, ...rest } = filters ?? {};
    const base = this.build(rest as Record<string, unknown>);
    const where: Prisma.ChatWhereInput = { ...(base as object) };
    if (search) where.name = this.ciContains(search);
    if (participantId) where.participantIds = { has: participantId };
    return where;
  }
}
