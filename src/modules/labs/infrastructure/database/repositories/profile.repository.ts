import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Profile } from 'src/modules/labs/domain/profile/profile.entity';
import { IProfileRepository } from 'src/modules/labs/domain/profile/interfaces/profile.repository.interface';

@Injectable()
export class ProfileRepository implements IProfileRepository {
  constructor(
    @InjectRepository(Profile)
    private readonly profileRepo: Repository<Profile>,
  ) {}

  async findById(id: string): Promise<Profile | null> {
    return this.profileRepo.findOne({
      where: { id },
      relations: { lab: true },
    });
  }

  async findByLabId(labId: string): Promise<Profile[]> {
    return this.profileRepo.find({
      where: { labId },
      order: { createdAt: 'ASC' },
    });
  }

  async save(profile: Profile): Promise<Profile> {
    return this.profileRepo.save(profile);
  }

  create(data: Partial<Profile>): Profile {
    return this.profileRepo.create(data);
  }
}
