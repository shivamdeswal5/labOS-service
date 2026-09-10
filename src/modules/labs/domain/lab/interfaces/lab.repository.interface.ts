import { Lab } from '../lab.entity';
import { Profile } from '../../profile/profile.entity';

export const LAB_REPOSITORY_TOKEN = Symbol('ILabRepository');

export interface ILabRepository {
  findById(id: string): Promise<Lab | null>;
  save(lab: Lab): Promise<Lab>;
  createLabWithOwner(labData: Partial<Lab>, profileData: Partial<Profile>): Promise<Lab>;
}
