import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { Lab } from 'src/modules/labs/domain/lab/lab.entity';
import { Profile } from 'src/modules/labs/domain/profile/profile.entity';
import { ILabRepository } from 'src/modules/labs/domain/lab/interfaces/lab.repository.interface';

@Injectable()
export class LabRepository implements ILabRepository {
  constructor(
    @InjectRepository(Lab)
    private readonly labRepo: Repository<Lab>,
    private readonly dataSource: DataSource,
  ) {}

  async findById(id: string): Promise<Lab | null> {
    return this.labRepo.findOne({
      where: { id },
      relations: { profiles: true },
    });
  }

  async save(lab: Lab): Promise<Lab> {
    return this.labRepo.save(lab);
  }

  async createLabWithOwner(
    labData: Partial<Lab>,
    profileData: Partial<Profile>,
  ): Promise<Lab> {
    return this.dataSource.transaction(async (manager) => {
      const lab = manager.create(Lab, labData);
      const savedLab = await manager.save(lab);

      const profile = manager.create(Profile, {
        ...profileData,
        labId: savedLab.id,
      });
      await manager.save(profile);

      return savedLab;
    });
  }
}
