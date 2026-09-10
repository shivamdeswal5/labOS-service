import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ReferringDoctor } from 'src/modules/referrals/domain/doctor/referring-doctor.entity';
import { IDoctorRepository } from 'src/modules/referrals/domain/doctor/interfaces/doctor-repository.interface';

@Injectable()
export class DoctorRepository implements IDoctorRepository {
  constructor(
    @InjectRepository(ReferringDoctor)
    private readonly doctorRepo: Repository<ReferringDoctor>,
  ) {}

  async findById(id: string, labId: string): Promise<ReferringDoctor | null> {
    return this.doctorRepo.findOne({
      where: { id, labId },
    });
  }

  async findByLabId(labId: string, search?: string): Promise<ReferringDoctor[]> {
    const query = this.doctorRepo
      .createQueryBuilder('doctor')
      .where('doctor.lab_id = :labId', { labId })
      .andWhere('doctor.deleted_at IS NULL');

    if (search) {
      query.andWhere(
        '(doctor.name ILIKE :search OR doctor.clinic ILIKE :search OR doctor.phone ILIKE :search)',
        { search: `%${search}%` },
      );
    }

    return query
      .orderBy('doctor.name', 'ASC')
      .getMany();
  }

  async save(doctor: ReferringDoctor): Promise<ReferringDoctor> {
    return this.doctorRepo.save(doctor);
  }

  async create(data: Partial<ReferringDoctor>): Promise<ReferringDoctor> {
    const doctor = this.doctorRepo.create(data);
    return this.doctorRepo.save(doctor);
  }

  async softDelete(id: string, labId: string): Promise<boolean> {
    const result = await this.doctorRepo.softDelete({ id, labId });
    return (result.affected ?? 0) > 0;
  }
}
