export class EmailMessageEntity {
  id!: string;
  status!: string;
}

export class EmailSearchItemEntity {
  event!: string;
  recipient!: string;
  timestamp!: number;
  subject?: string;
}

export class EmailSearchResultEntity {
  items!: EmailSearchItemEntity[];
}
