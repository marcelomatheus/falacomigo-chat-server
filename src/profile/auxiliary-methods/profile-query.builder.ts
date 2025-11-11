import { Prisma } from '@prisma/client';
import { FilterProfileDto } from '../dto/filter-profile.dto';
import { BaseQueryBuilder } from '../../prisma/auxiliary-methods/base-query-builder';

export class ProfileQueryBuilder extends BaseQueryBuilder {
  buildWhere(filters: FilterProfileDto): Prisma.ProfileWhereInput {
    const { search, knownLanguages, ...rest } = filters ?? {};
    const base = this.build(rest as Record<string, unknown>);
    const where: Prisma.ProfileWhereInput = { ...(base as object) };
    if (search) where.name = this.ciContains(search);
    if (knownLanguages) {
      const langs = String(knownLanguages)
        .split(',')
        .map((l) => l.trim())
        .filter(Boolean);
      if (langs.length === 1) where.knownLanguages = { has: langs[0] };
      else if (langs.length > 1) where.knownLanguages = { hasSome: langs };
    }
    return where;
  }
}
