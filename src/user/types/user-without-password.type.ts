import { Profile, User } from '@prisma/client';
export interface IUserAndProfile extends User {
  profile: Profile;
}
export type UserWithoutPassword = Omit<IUserAndProfile, 'password'>;
