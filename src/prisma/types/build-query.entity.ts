export type Primitive = string | number | boolean | Date;

export type StringContains = {
  contains: string;
  mode?: 'default' | 'insensitive';
};

export type InList = {
  in: Array<string | number | Date>;
};

export type ArrayHas = {
  has: string | number;
};

export type Range<T extends number | Date> = {
  gt?: T;
  gte?: T;
  lt?: T;
  lte?: T;
};

export type WhereValue =
  | Primitive
  | StringContains
  | InList
  | ArrayHas
  | Range<number>
  | Range<Date>;

export type Where = Record<string, WhereValue | WhereValue[]>;
