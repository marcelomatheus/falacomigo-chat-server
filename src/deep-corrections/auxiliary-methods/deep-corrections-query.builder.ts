import { Prisma } from '@prisma/client';
import { FilterDeepCorrectionsDto } from '../dto/filter-message.dto';
import { BaseQueryBuilder } from '../../prisma/auxiliary-methods/base-query-builder';

export class DeepCorrectionsQueryBuilder extends BaseQueryBuilder {
  buildWhere(
    filters: FilterDeepCorrectionsDto,
  ): Prisma.DeepCorrectionsWhereInput {
    const { profileId, messageId, title, ...rest } = filters ?? {};
    const base = this.build(rest as Record<string, unknown>);
    const where: Prisma.DeepCorrectionsWhereInput = { ...(base as object) };
    if (profileId) where.profileId = profileId;
    if (messageId) where.messageId = messageId;
    if (title) where.title = title;
    return where;
  }
}
