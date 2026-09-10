import { Profile } from '../profile.entity';

export const PROFILE_REPOSITORY_TOKEN = Symbol('IProfileRepository');

export interface IProfileRepository {
  findById(id: string): Promise<Profile | null>;
  findByLabId(labId: string): Promise<Profile[]>;
  save(profile: Profile): Promise<Profile>;
  create(data: Partial<Profile>): Profile;
}
