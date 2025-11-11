export class ProfileEntity {
  id?: string;
  name: string;
  photoUrl?: string | null;
  userId: string;
  tokensBalance: number;
  learningLang: string;
  learningLevel: string;
  knownLanguages: string[];
  chatIds: string[];
  createdAt: Date;
  updatedAt: Date;
}
