export class DeepCorrectionsEntity {
  id!: string;
  profileId!: string;
  messageId!: string;
  title!: string;
  explanation!: string;
  example!: string;
  targetLanguage!: string;
  createdAt!: Date;
  updatedAt!: Date;
}
