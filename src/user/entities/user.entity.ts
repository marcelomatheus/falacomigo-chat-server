export class UserEntity {
  id?: string;
  email: string;
  lastLoginTimestamp?: Date | null;
  confirmEmailTimestamp?: Date | null;
  createdAt: Date;
  updatedAt: Date;
}
