export class ProfileEntity {
  id?: string;
  name: string;
  photoUrl?: string | null;
  userId: string;
  tokensBalance: number;
  learningLang: string | null;
  learningLevel: string | null;
  knownLanguages: string[];
  chatIds: string[];
  createdAt: Date;
  updatedAt: Date;
}
