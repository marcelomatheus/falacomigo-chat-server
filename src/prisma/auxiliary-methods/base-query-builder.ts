import { WhereValue, StringContains, Where } from '../types/build-query.entity';
export class BaseQueryBuilder {
  build<T extends Record<string, unknown>>(filters: T): Where {
    const where: Where = {};
    Object.keys(filters).forEach((key) => {
      const value = filters[key];
      if (value === undefined || value === null || value === '') return;

      if (typeof value === 'string' && value.includes(',')) {
        where[key] = { in: value.split(',') };
      } else if (typeof value === 'string') {
        where[key] = { contains: value, mode: 'insensitive' };
      } else {
        where[key] = value as WhereValue;
      }
    });
    return where;
  }

  ciContains(value: string): StringContains {
    return { contains: value, mode: 'insensitive' };
  }
}

export function buildQuery<T extends Record<string, unknown>>(
  filters: T,
): Where {
  return new BaseQueryBuilder().build(filters);
}
