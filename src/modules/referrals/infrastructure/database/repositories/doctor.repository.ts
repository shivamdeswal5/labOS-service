import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ReferringDoctor } from 'src/modules/referrals/domain/doctor/referring-doctor.entity';
import { IDoctorRepository } from 'src/modules/referrals/domain/doctor/interfaces/doctor-repository.interface';
import {
  CommissionStatusEnum,
  CommissionStatusEnumMapper,
} from 'src/modules/referrals/domain/commission/enums/commission-status.enum';

@Injectable()
export class DoctorRepository implements IDoctorRepository {
  constructor(
    @InjectRepository(ReferringDoctor)
    private readonly doctorRepo: Repository<ReferringDoctor>,
  ) { }

  async findById(id: string, labId: string): Promise<ReferringDoctor | null> {
    return this.doctorRepo.findOne({
      where: { id, labId },
    });
  }

  async findByLabId(labId: string, search?: string): Promise<ReferringDoctor[]> {
    const pendingVal = CommissionStatusEnumMapper[CommissionStatusEnum.PENDING];
    const settledVal = CommissionStatusEnumMapper[CommissionStatusEnum.SETTLED];

    const query = this.doctorRepo
      .createQueryBuilder('doctor')
      .leftJoin('doctor.commissionLedgers', 'ledger')
      .select([
        'doctor.id',
        'doctor.createdAt',
        'doctor.updatedAt',
        'doctor.version',
        'doctor.labId',
        'doctor.name',
        'doctor.clinic',
        'doctor.phone',
        'doctor.email',
        'doctor.commissionType',
        'doctor.commissionValue',
        'doctor.notes',
      ])
      .addSelect(`COALESCE(SUM(CASE WHEN ledger.status = ${pendingVal} THEN ledger.amount ELSE 0 END), 0)`, 'pendingAmount')
      .addSelect(`COALESCE(SUM(CASE WHEN ledger.status = ${settledVal} THEN ledger.amount ELSE 0 END), 0)`, 'settledAmount')
      .addSelect('COUNT(DISTINCT ledger.id)', 'activeCasesCount')
      .where('doctor.lab_id = :labId', { labId })
      .andWhere('doctor.deleted_at IS NULL')
      .groupBy('doctor.id');

    if (search) {
      query.andWhere(
        '(doctor.name ILIKE :search OR doctor.clinic ILIKE :search OR doctor.phone ILIKE :search)',
        { search: `%${search}%` },
      );
    }

    const { entities, raw } = await query
      .orderBy('doctor.name', 'ASC')
      .getRawAndEntities();

    return entities.map((doctor, index) => {
      doctor.pendingAmount = parseFloat(raw[index]?.pendingAmount || '0');
      doctor.settledAmount = parseFloat(raw[index]?.settledAmount || '0');
      doctor.activeCasesCount = parseInt(raw[index]?.activeCasesCount || '0', 10);
      return doctor;
    });
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
